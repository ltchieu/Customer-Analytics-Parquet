package com.example.customer_analysis.repository;

import com.example.customer_analysis.entity.Segment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface SegmentRepository extends JpaRepository<Segment, Integer> {
    Optional<Segment> findBySegmentId(Integer segmentId);
    List<Segment> findTop3ByOrderByAvgSpendingDesc();
}