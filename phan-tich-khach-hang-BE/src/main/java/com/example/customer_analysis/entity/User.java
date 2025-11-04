package com.example.customer_analysis.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manguoidung")
    private Integer userId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "sdt", unique = true)
    private String phoneNumber;

    @Column(name = "matkhau", nullable = false)
    private String passwordHash;

    @Column(name = "ngaytao", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}