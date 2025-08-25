import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import AIChat from "../AIChat";
import { toast } from "react-toastify";

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock axios
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../../utils/axios", () => mockApi);

// Mock AuthContext
const mockAuthContext = {
  user: { id: 1, email: "test@example.com" },
  isAuthenticated: true,
  isAdmin: false,
};

jest.mock("../../context/AuthContext", () => ({
  AuthContext: {
    Consumer: ({ children }) => children(mockAuthContext),
  },
  AuthProvider: ({ children }) => children,
}));

describe("AIChat Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.get.mockResolvedValue({ data: [] });
  });

  const renderAIChat = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AIChat />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test("renders AI Chat interface", () => {
    renderAIChat();

    expect(screen.getByText("AI Chat History")).toBeInTheDocument();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Ask me anything about food/)
    ).toBeInTheDocument();
  });

  test("shows welcome screen when no messages", () => {
    renderAIChat();

    expect(screen.getByText("Welcome to AI Assistant! 👋")).toBeInTheDocument();
    expect(
      screen.getByText(
        "I'm here to help you with cooking, nutrition, grocery shopping, and more!"
      )
    ).toBeInTheDocument();
  });

  test("displays quick suggestions", () => {
    renderAIChat();

    expect(
      screen.getByText("What are some healthy breakfast ideas?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("How do I store fresh vegetables?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Can you suggest budget-friendly meal options?")
    ).toBeInTheDocument();
  });

  test("clicking suggestion fills input field", () => {
    renderAIChat();

    const suggestion = screen.getByText(
      "What are some healthy breakfast ideas?"
    );
    fireEvent.click(suggestion);

    const input = screen.getByPlaceholderText(/Ask me anything about food/);
    expect(input.value).toBe("What are some healthy breakfast ideas?");
  });

  test("shows new chat modal when clicking new chat button", () => {
    renderAIChat();

    const newChatButton = screen.getByText("+");
    fireEvent.click(newChatButton);

    expect(screen.getByText("Start New Chat")).toBeInTheDocument();
    expect(
      screen.getByText("Start a new conversation with your AI assistant about:")
    ).toBeInTheDocument();
  });

  test("starts new chat when modal is confirmed", async () => {
    renderAIChat();

    const newChatButton = screen.getByText("+");
    fireEvent.click(newChatButton);

    const startChatButton = screen.getByText("Start Chat");
    fireEvent.click(startChatButton);

    // Modal should close and input should be focused
    expect(screen.queryByText("Start New Chat")).not.toBeInTheDocument();
  });

  test("sends message when form is submitted", async () => {
    mockApi.post.mockResolvedValue({
      data: {
        response: "🍳 Here are some healthy breakfast ideas...",
        chatId: "123",
      },
    });

    renderAIChat();

    const input = screen.getByPlaceholderText(/Ask me anything about food/);
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, {
      target: { value: "What are some healthy breakfast ideas?" },
    });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith("/api/ai/chat", {
        message: "What are some healthy breakfast ideas?",
        chatId: null,
      });
    });
  });

  test("shows loading state while sending message", async () => {
    mockApi.post.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderAIChat();

    const input = screen.getByPlaceholderText(/Ask me anything about food/);
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    expect(screen.getByText("AI is thinking...")).toBeInTheDocument();
  });

  test("loads chat history on mount", () => {
    renderAIChat();

    expect(mockApi.get).toHaveBeenCalledWith("/api/ai/chat-history");
  });

  test("shows error toast when API call fails", async () => {
    mockApi.post.mockRejectedValue(new Error("API Error"));

    renderAIChat();

    const input = screen.getByPlaceholderText(/Ask me anything about food/);
    const sendButton = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to send message");
    });
  });

  test("requires authentication to access", () => {
    // Mock unauthenticated user
    mockAuthContext.isAuthenticated = false;

    renderAIChat();

    expect(
      screen.getByText(/Please login to access the AI Chat feature/)
    ).toBeInTheDocument();
  });

  test("displays chat history when available", async () => {
    const mockChats = [
      {
        id: 1,
        title: "Breakfast Ideas",
        lastMessage: "🍳 Here are some healthy...",
        updatedAt: "2024-01-15T10:30:00",
      },
    ];

    mockApi.get.mockResolvedValue({ data: mockChats });

    renderAIChat();

    await waitFor(() => {
      expect(screen.getByText("Breakfast Ideas")).toBeInTheDocument();
      expect(
        screen.getByText("🍳 Here are some healthy...")
      ).toBeInTheDocument();
    });
  });

  test("deletes chat when delete button is clicked", async () => {
    const mockChats = [
      {
        id: 1,
        title: "Test Chat",
        lastMessage: "Test message",
        updatedAt: "2024-01-15T10:30:00",
      },
    ];

    mockApi.get.mockResolvedValue({ data: mockChats });
    mockApi.delete.mockResolvedValue({
      data: { message: "Chat deleted successfully" },
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    renderAIChat();

    await waitFor(() => {
      expect(screen.getByText("Test Chat")).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this chat?"
    );

    await waitFor(() => {
      expect(mockApi.delete).toHaveBeenCalledWith("/api/ai/chat/1");
    });
  });
});
