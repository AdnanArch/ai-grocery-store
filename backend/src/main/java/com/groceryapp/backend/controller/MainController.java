package com.groceryapp.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Legacy controller for admin pages
 * Note: Most frontend routes are now handled by SpaController for the React app
 */
@Controller
public class MainController {

    // Removed conflicting mappings for /, /login, and /register
    // These are now handled by SpaController

    @GetMapping("/admin")
    public String adminDashboard() {
        return "forward:/admin/dashboard.html";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboardRedirect() {
        return "redirect:/admin";
    }
}
