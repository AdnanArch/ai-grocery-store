package com.groceryapp.backend.controller;

import lombok.Data;

@Data
public class OTPRequest {
    private String email;
    private String otp;
    private AuthRequest userData; // For registration data
}
