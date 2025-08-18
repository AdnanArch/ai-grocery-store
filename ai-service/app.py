# ai-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import json
import requests
from datetime import datetime, timedelta
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models and data
user_product_matrix = None
product_similarity_matrix = None
tfidf_matrix = None
product_features = None


class AIRecommendationEngine:
    def __init__(self):
        self.backend_url = "http://localhost:8080"
        self.user_product_matrix = None
        self.product_similarity_matrix = None
        self.tfidf_matrix = None
        self.product_features = None

    def load_data_from_backend(self):
        """Load data from backend API"""
        try:
            logger.info("Attempting to connect to backend at: %s", self.backend_url)

            # Load products
            products_response = requests.get(
                f"{self.backend_url}/api/products?size=1000", timeout=10
            )
            products_response.raise_for_status()
            products = products_response.json()["content"]
            logger.info("Loaded %d products from backend", len(products))

            # Load orders
            orders_response = requests.get(f"{self.backend_url}/api/orders", timeout=10)
            orders_response.raise_for_status()
            orders = orders_response.json()
            logger.info("Loaded %d orders from backend", len(orders))

            # Load users
            users_response = requests.get(f"{self.backend_url}/api/users", timeout=10)
            users_response.raise_for_status()
            users = users_response.json()
            logger.info("Loaded %d users from backend", len(users))

            return products, orders, users
        except requests.exceptions.ConnectionError as e:
            logger.error("Connection error when loading data from backend: %s", e)
            return [], [], []
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error when loading data from backend: %s", e)
            return [], [], []
        except requests.exceptions.RequestException as e:
            logger.error("Request error when loading data from backend: %s", e)
            return [], [], []
        except Exception as e:
            logger.error("Unexpected error when loading data from backend: %s", e)
            return [], [], []

    def create_user_product_matrix(self, orders):
        """Create user-product interaction matrix"""
        if not orders:
            return pd.DataFrame()

        # Extract user-product interactions
        interactions = []
        for order in orders:
            user_id = order.get("user", {}).get("id")
            if user_id and order.get("items"):
                for item in order["items"]:
                    product_id = item.get("product", {}).get("id")
                    quantity = item.get("quantity", 1)
                    if product_id:
                        interactions.append(
                            {
                                "user_id": user_id,
                                "product_id": product_id,
                                "quantity": quantity,
                            }
                        )

        if not interactions:
            return pd.DataFrame()

        df = pd.DataFrame(interactions)
        matrix = df.pivot_table(
            index="user_id", columns="product_id", values="quantity", fill_value=0
        )
        return matrix

    def create_product_similarity_matrix(self, products):
        """Create product similarity matrix using content-based filtering"""
        if not products:
            return pd.DataFrame()

        # Create product features
        product_data = []
        for product in products:
            features = f"{product.get('name', '')} {product.get('description', '')} {product.get('category', {}).get('name', '')}"
            product_data.append(
                {
                    "id": product["id"],
                    "features": features,
                    "price": product.get("price", 0),
                    "category": product.get("category", {}).get("name", ""),
                }
            )

        df = pd.DataFrame(product_data)

        # TF-IDF vectorization
        tfidf = TfidfVectorizer(stop_words="english", max_features=1000)
        tfidf_matrix = tfidf.fit_transform(df["features"])

        # Calculate cosine similarity
        similarity_matrix = cosine_similarity(tfidf_matrix)

        return pd.DataFrame(similarity_matrix, index=df["id"], columns=df["id"])

    def get_collaborative_recommendations(self, user_id, n_recommendations=10):
        """Get collaborative filtering recommendations"""
        if (
            self.user_product_matrix is None
            or user_id not in self.user_product_matrix.index
        ):
            return []

        # Find similar users
        user_vector = self.user_product_matrix.loc[user_id]
        similar_users = self.user_product_matrix.corrwith(user_vector).sort_values(
            ascending=False
        )[1:6]

        # Get products from similar users
        recommendations = []
        for similar_user_id in similar_users.index:
            similar_user_products = self.user_product_matrix.loc[similar_user_id]
            purchased_products = similar_user_products[similar_user_products > 0].index
            for product_id in purchased_products:
                if product_id not in user_vector[user_vector > 0].index:
                    recommendations.append(
                        {
                            "product_id": product_id,
                            "score": similar_users[similar_user_id],
                            "reason": "Similar users also bought this",
                        }
                    )

        # Sort by score and return top N
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:n_recommendations]

    def get_content_based_recommendations(self, user_id, n_recommendations=10):
        """Get content-based filtering recommendations"""
        if (
            self.user_product_matrix is None
            or user_id not in self.user_product_matrix.index
        ):
            return []

        # Get user's purchased products
        user_products = self.user_product_matrix.loc[user_id]
        purchased_products = user_products[user_products > 0].index

        if len(purchased_products) == 0:
            return []

        # Calculate average similarity to purchased products
        product_scores = {}
        for purchased_product in purchased_products:
            if purchased_product in self.product_similarity_matrix.index:
                similarities = self.product_similarity_matrix.loc[purchased_product]
                for product_id, similarity in similarities.items():
                    if product_id not in purchased_products:
                        if product_id not in product_scores:
                            product_scores[product_id] = []
                        product_scores[product_id].append(similarity)

        # Average the scores
        recommendations = []
        for product_id, scores in product_scores.items():
            avg_score = np.mean(scores)
            recommendations.append(
                {
                    "product_id": product_id,
                    "score": avg_score,
                    "reason": "Similar to products you bought",
                }
            )

        # Sort by score and return top N
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:n_recommendations]

    def get_trending_products(self, days=7, n_recommendations=10):
        """Get trending products based on recent orders"""
        try:
            # Get recent orders from backend
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)

            orders_response = requests.get(f"{self.backend_url}/api/orders", timeout=10)
            orders_response.raise_for_status()
            orders = orders_response.json()

            # Filter recent orders
            recent_orders = []
            for order in orders:
                order_date = datetime.fromisoformat(
                    order["createdAt"].replace("Z", "+00:00")
                )
                if start_date <= order_date <= end_date:
                    recent_orders.append(order)

            # Count product popularity
            product_counts = {}
            for order in recent_orders:
                for item in order.get("items", []):
                    product_id = item.get("product", {}).get("id")
                    quantity = item.get("quantity", 1)
                    if product_id:
                        product_counts[product_id] = (
                            product_counts.get(product_id, 0) + quantity
                        )

            # Sort by popularity
            trending_products = sorted(
                product_counts.items(), key=lambda x: x[1], reverse=True
            )

            recommendations = []
            for product_id, count in trending_products[:n_recommendations]:
                recommendations.append(
                    {
                        "product_id": product_id,
                        "score": count,
                        "reason": f"Popular among customers (bought {count} times recently)",
                    }
                )

            return recommendations
        except requests.exceptions.ConnectionError as e:
            logger.error("Connection error when getting trending products: %s", e)
            return []
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error when getting trending products: %s", e)
            return []
        except requests.exceptions.RequestException as e:
            logger.error("Request error when getting trending products: %s", e)
            return []
        except Exception as e:
            logger.error("Unexpected error when getting trending products: %s", e)
            return []

    def get_seasonal_recommendations(self, n_recommendations=10):
        """Get seasonal recommendations based on current month"""
        try:
            current_month = datetime.now().month

            # Define seasonal categories
            seasonal_categories = {
                12: ["Holiday", "Winter", "Christmas"],  # December
                1: ["Winter", "New Year"],  # January
                2: ["Winter", "Valentine"],  # February
                3: ["Spring", "Easter"],  # March
                4: ["Spring", "Easter"],  # April
                5: ["Spring", "Mother's Day"],  # May
                6: ["Summer", "Father's Day"],  # June
                7: ["Summer", "Independence Day"],  # July
                8: ["Summer", "Back to School"],  # August
                9: ["Fall", "Back to School"],  # September
                10: ["Fall", "Halloween"],  # October
                11: ["Fall", "Thanksgiving"],  # November
            }

            current_seasons = seasonal_categories.get(current_month, [])

            # Get products from seasonal categories
            products_response = requests.get(
                f"{self.backend_url}/api/products?size=1000", timeout=10
            )
            products_response.raise_for_status()
            products = products_response.json()["content"]

            seasonal_products = []
            for product in products:
                category_name = product.get("category", {}).get("name", "").lower()
                product_name = product.get("name", "").lower()

                for season in current_seasons:
                    if (
                        season.lower() in category_name
                        or season.lower() in product_name
                    ):
                        seasonal_products.append(
                            {
                                "product_id": product["id"],
                                "score": 1.0,
                                "reason": f"Perfect for {season} season",
                            }
                        )
                        break

            return seasonal_products[:n_recommendations]
        except requests.exceptions.ConnectionError as e:
            logger.error(
                "Connection error when getting seasonal recommendations: %s", e
            )
            return []
        except requests.exceptions.Timeout as e:
            logger.error("Timeout error when getting seasonal recommendations: %s", e)
            return []
        except requests.exceptions.RequestException as e:
            logger.error("Request error when getting seasonal recommendations: %s", e)
            return []
        except Exception as e:
            logger.error(
                "Unexpected error when getting seasonal recommendations: %s", e
            )
            return []

    def train_models(self):
        """Train and update recommendation models"""
        try:
            logger.info("Loading data from backend...")
            products, orders, users = self.load_data_from_backend()

            logger.info("Creating user-product matrix...")
            self.user_product_matrix = self.create_user_product_matrix(orders)

            logger.info("Creating product similarity matrix...")
            self.product_similarity_matrix = self.create_product_similarity_matrix(
                products
            )

            logger.info("Models trained successfully!")
            return True
        except Exception as e:
            logger.error(f"Error training models: {e}")
            return False


# Initialize recommendation engine
recommendation_engine = AIRecommendationEngine()


@app.route("/")
def hello():
    return "AI Recommendation Service is running!"


@app.route("/health")
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "models_loaded": recommendation_engine.user_product_matrix is not None,
        }
    )


@app.route("/train", methods=["POST"])
def train_models():
    """Train recommendation models"""
    success = recommendation_engine.train_models()
    return jsonify(
        {
            "success": success,
            "message": (
                "Models trained successfully" if success else "Failed to train models"
            ),
        }
    )


@app.route("/recommendations/<int:user_id>", methods=["GET"])
def get_recommendations(user_id):
    """Get personalized recommendations for a user"""
    try:
        n_recommendations = int(request.args.get("limit", 10))

        # Get different types of recommendations
        collaborative = recommendation_engine.get_collaborative_recommendations(
            user_id, n_recommendations
        )
        content_based = recommendation_engine.get_content_based_recommendations(
            user_id, n_recommendations
        )
        trending = recommendation_engine.get_trending_products(
            n_recommendations=n_recommendations
        )
        seasonal = recommendation_engine.get_seasonal_recommendations(
            n_recommendations=n_recommendations
        )

        # Combine and deduplicate recommendations
        all_recommendations = {}

        for rec in collaborative:
            product_id = rec["product_id"]
            if product_id not in all_recommendations:
                all_recommendations[product_id] = rec
            else:
                all_recommendations[product_id]["score"] += rec["score"]

        for rec in content_based:
            product_id = rec["product_id"]
            if product_id not in all_recommendations:
                all_recommendations[product_id] = rec
            else:
                all_recommendations[product_id]["score"] += rec["score"]

        # Add trending and seasonal if not already present
        for rec in trending:
            product_id = rec["product_id"]
            if product_id not in all_recommendations:
                all_recommendations[product_id] = rec

        for rec in seasonal:
            product_id = rec["product_id"]
            if product_id not in all_recommendations:
                all_recommendations[product_id] = rec

        # Sort by score and return top recommendations
        final_recommendations = sorted(
            all_recommendations.values(), key=lambda x: x["score"], reverse=True
        )[:n_recommendations]

        return jsonify(
            {
                "user_id": user_id,
                "recommendations": final_recommendations,
                "types": {
                    "collaborative": len(collaborative),
                    "content_based": len(content_based),
                    "trending": len(trending),
                    "seasonal": len(seasonal),
                },
            }
        )

    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/trending", methods=["GET"])
def get_trending_products():
    """Get trending products"""
    try:
        days = int(request.args.get("days", 7))
        limit = int(request.args.get("limit", 10))

        trending = recommendation_engine.get_trending_products(days, limit)

        return jsonify({"trending_products": trending, "period_days": days})

    except Exception as e:
        logger.error(f"Error getting trending products: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/similar/<int:product_id>", methods=["GET"])
def get_similar_products(product_id):
    """Get similar products based on content similarity"""
    try:
        limit = int(request.args.get("limit", 10))

        if recommendation_engine.product_similarity_matrix is None:
            return jsonify({"error": "Product similarity matrix not available"}), 500

        if product_id not in recommendation_engine.product_similarity_matrix.index:
            return jsonify({"error": "Product not found"}), 404

        # Get similar products
        similarities = recommendation_engine.product_similarity_matrix.loc[product_id]
        similar_products = similarities.sort_values(ascending=False)[1 : limit + 1]

        recommendations = []
        for similar_product_id, similarity in similar_products.items():
            recommendations.append(
                {
                    "product_id": similar_product_id,
                    "score": similarity,
                    "reason": "Similar to this product",
                }
            )

        return jsonify({"product_id": product_id, "similar_products": recommendations})

    except Exception as e:
        logger.error(f"Error getting similar products: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Train models on startup
    logger.info("Starting AI Recommendation Service...")
    recommendation_engine.train_models()

    app.run(host="0.0.0.0", port=5000, debug=True)
