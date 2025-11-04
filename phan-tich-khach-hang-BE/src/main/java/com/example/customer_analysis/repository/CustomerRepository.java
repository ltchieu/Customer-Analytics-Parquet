package com.example.customer_analysis.repository;

import com.example.customer_analysis.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    List<Customer> findBySegment(Integer segment);
    List<Customer> findByMaritalStatus(String maritalStatus);

    @Query("SELECT AVG(c.mntWines + c.mntFruits + c.mntMeatProducts + c.mntFishProducts + c.mntSweetProducts + c.mntGoldProds) FROM Customer c")
    Double findAverageSpending();

    @Query("SELECT AVG((c.acceptedCmp1 + c.acceptedCmp2 + c.acceptedCmp3 + c.acceptedCmp4 + c.acceptedCmp5)/5.0) FROM Customer c")
    Double findAverageResponseRate();

    @Query("SELECT c.segment, COUNT(c) FROM Customer c GROUP BY c.segment")
    List<Object[]> findSegmentDistribution();

    @Query("SELECT CASE " +
            "WHEN c.income < 20000 THEN '<20k' " +
            "WHEN c.income < 50000 THEN '20k-50k' " +
            "WHEN c.income < 80000 THEN '50k-80k' " +
            "ELSE '80k+' END, c.segment, COUNT(c) " +
            "FROM Customer c GROUP BY CASE " +
            "WHEN c.income < 20000 THEN '<20k' " +
            "WHEN c.income < 50000 THEN '20k-50k' " +
            "WHEN c.income < 80000 THEN '50k-80k' " +
            "ELSE '80k+' END, c.segment")
    List<Object[]> findIncomeBySegment();

    @Query("SELECT c.education, c.segment, COUNT(c) FROM Customer c GROUP BY c.education, c.segment")
    List<Object[]> findEducationBySegment();

    @Query("SELECT c.maritalStatus, c.segment, COUNT(c) FROM Customer c GROUP BY c.maritalStatus, c.segment")
    List<Object[]> findMaritalStatusBySegment();
}