package com.example.customer_analysis.controller;

import com.example.customer_analysis.dto.request.LoginRequest;
import com.example.customer_analysis.dto.response.ApiResponse;
import com.example.customer_analysis.dto.response.LoginResponse;
import com.example.customer_analysis.dto.response.TokenRefreshResponse;
import com.example.customer_analysis.entity.RefreshToken;
import com.example.customer_analysis.entity.User;
import com.example.customer_analysis.exception.AppException;
import com.example.customer_analysis.exception.ErrorCode;
import com.example.customer_analysis.security.jwt.JwtUtils;
import com.example.customer_analysis.security.model.UserDetailsImpl;
import com.example.customer_analysis.service.RefreshTokenService;
import com.example.customer_analysis.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;


    // ===== LOGIN =====
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String accessToken = jwtUtils.generateJwtToken(authentication);

            // Tạo refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

            // Set HTTP-only cookie cho refresh token
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken.getRefreshToken())
                    .httpOnly(true)
                    .secure(false)
                    .path("/auth/refreshtoken")
                    .maxAge(Duration.ofDays(7))
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            LoginResponse loginResponse = new LoginResponse(accessToken, refreshToken.getRefreshToken(), userDetails.getId());
            return ResponseEntity.ok().body(ApiResponse.builder().message("Login Successfully").data(loginResponse).build());
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.builder().message("Invalid email or password").build());
        }
    }

    // ===== REFRESH TOKEN =====
    @PostMapping("/refreshtoken")
    public ResponseEntity<ApiResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletResponse response) {

        String requestRefreshToken = cookieRefreshToken; // lấy giá trị từ cookie
        if (requestRefreshToken == null && body != null) {
            requestRefreshToken = body.get("refreshToken");
        }

        if (requestRefreshToken == null) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_NOT_FOUND);
        }

        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new AppException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();

        refreshTokenService.setRevoked(refreshToken);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getUserId());

        String accessToken = jwtUtils.generateTokenFromIdentifier(user.getPhoneNumber());

        // Set new refresh token cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", newRefreshToken.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/auth/refreshtoken")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        TokenRefreshResponse tokenRefreshResponse = new TokenRefreshResponse(accessToken, newRefreshToken.getRefreshToken());

        return ResponseEntity.ok().body(ApiResponse.builder()
                .message("New Refresh Token and Access Token are created Successfully")
                .data(tokenRefreshResponse)
                .build());
    }

    // ===== LOGOUT =====
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletResponse response) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userService.getUserByIdentifier(email);

            refreshTokenService.deleteByUserId(user.getUserId());
            SecurityContextHolder.clearContext();


            ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/auth/refreshtoken")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return ResponseEntity.ok(ApiResponse.builder().message("Logout successful").build());
    }
}
