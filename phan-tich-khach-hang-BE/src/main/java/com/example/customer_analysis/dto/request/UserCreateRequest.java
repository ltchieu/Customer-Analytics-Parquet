package com.example.customer_analysis.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserCreateRequest {

    @Email(message = "INVALID_EMAIL")
    private String email;
    @NotBlank(message = "FIELD REQUIRED")
    @Pattern(
            regexp = "^(0|\\+84)[0-9]{9}$",
            message = "INVALID_PHONE_NUMBER"
    )
    private String phoneNumber;

}
