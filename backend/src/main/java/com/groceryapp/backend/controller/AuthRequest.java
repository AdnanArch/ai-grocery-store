package com.groceryapp.backend.controller;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
}