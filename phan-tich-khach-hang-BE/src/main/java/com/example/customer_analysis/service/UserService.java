package com.example.customer_analysis.service;

import com.example.customer_analysis.dto.request.SignupRequest;
import com.example.customer_analysis.entity.User;
import com.example.customer_analysis.exception.AppException;
import com.example.customer_analysis.exception.ErrorCode;
import com.example.customer_analysis.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

//    @Transactional
//    public User createUser(SignupRequest signupRequest) {
//
//        String phoneNumber = signupRequest.getPhoneNumber();
//        String email = signupRequest.getEmail();
//
//        // Kiểm tra trùng email hoặc số điện thoại
//        if (userRepository.existsByPhoneNumber(phoneNumber)) {
//            throw new AppException(ErrorCode.USER_PHONE_OR_EMAIL_EXIST);
//        }
//
//
//        // Tạo đối tượng User mới
//        User user = new User();
//        user.setEmail(email);
//        user.setPhoneNumber(phoneNumber);
//        user.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));
//        user.setCreatedAt(LocalDateTime.now());
//
//        // Lưu vào DB
//        return userRepository.save(user);
//    }

    public User getUserByIdentifier(String identifier) {
        return userRepository.findByEmail(identifier)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}