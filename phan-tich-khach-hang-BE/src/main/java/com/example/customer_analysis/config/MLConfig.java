package com.example.customer_analysis.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
@ConfigurationProperties(prefix = "ml")
@Data
@Slf4j
public class MLConfig {

    private String modelDir = "models/";
    private String reportDir = "reports/";
    private int defaultClusters = 4;
    private int maxIterations = 100;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(modelDir));
            Files.createDirectories(Paths.get(reportDir));
            log.info("ML directories initialized: {}, {}", modelDir, reportDir);
        } catch (IOException e) {
            log.error(" Failed to create ML directories", e);
            throw new RuntimeException("Could not initialize ML directories", e);
        }
    }
}
