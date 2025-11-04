package com.example.customer_analysis.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    @Email(message = "INVALID_EMAIL")
    private String email;

    @Size(min = 6, max = 20, message = "INVALID_PASSWORD")
    @NotBlank(message = "FIELD_REQUIRED")
    private String password;
}
