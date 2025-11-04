package com.example.customer_analysis.config;

import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static java.util.Map.entry;

@Configuration
public class ColumnMappingConfig {

    // Define required columns and their possible variations
    public static final Map<String, List<String>> COLUMN_MAPPINGS = Map.ofEntries(
            entry("ID", Arrays.asList("id", "customer_id", "customerid", "cust_id")),
            entry("Education", Arrays.asList("education", "edu", "education_level")),
            entry("Marital_Status", Arrays.asList("marital_status", "maritalstatus", "marital", "marriage_status")),
            entry("Income", Arrays.asList("income", "yearly_income", "annual_income", "salary")),
            entry("MntWines", Arrays.asList("mntwines", "mnt_wines", "wines", "wine_amount")),
            entry("MntFruits", Arrays.asList("mntfruits", "mnt_fruits", "fruits", "fruit_amount")),
            entry("MntMeatProducts", Arrays.asList("mntmeatproducts", "mnt_meat_products", "meat", "meat_amount")),
            entry("MntFishProducts", Arrays.asList("mntfishproducts", "mnt_fish_products", "fish", "fish_amount")),
            entry("MntSweetProducts", Arrays.asList("mntsweetproducts", "mnt_sweet_products", "sweets", "sweet_amount")),
            entry("MntGoldProds", Arrays.asList("mntgoldprods", "mnt_gold_prods", "gold", "gold_amount")),
            entry("NumWebPurchases", Arrays.asList("numwebpurchases", "num_web_purchases", "web_purchases", "online_purchases")),
            entry("NumCatalogPurchases", Arrays.asList("numcatalogpurchases", "num_catalog_purchases", "catalog_purchases")),
            entry("NumStorePurchases", Arrays.asList("numstorepurchases", "num_store_purchases", "store_purchases")),
            entry("AcceptedCmp1", Arrays.asList("acceptedcmp1", "accepted_cmp1", "campaign1", "cmp1")),
            entry("AcceptedCmp2", Arrays.asList("acceptedcmp2", "accepted_cmp2", "campaign2", "cmp2")),
            entry("AcceptedCmp3", Arrays.asList("acceptedcmp3", "accepted_cmp3", "campaign3", "cmp3")),
            entry("AcceptedCmp4", Arrays.asList("acceptedcmp4", "accepted_cmp4", "campaign4", "cmp4")),
            entry("AcceptedCmp5", Arrays.asList("acceptedcmp5", "accepted_cmp5", "campaign5", "cmp5"))
    );

    // Define default values for missing columns
    public static final Map<String, Object> DEFAULT_VALUES = Map.ofEntries(
            entry("Education", "Unknown"),
            entry("Marital_Status", "Unknown"),
            entry("Income", 0.0),
            entry("MntWines", 0.0),
            entry("MntFruits", 0.0),
            entry("MntMeatProducts", 0.0),
            entry("MntFishProducts", 0.0),
            entry("MntSweetProducts", 0.0),
            entry("MntGoldProds", 0.0),
            entry("NumWebPurchases", 0),
            entry("NumCatalogPurchases", 0),
            entry("NumStorePurchases", 0),
            entry("AcceptedCmp1", 0),
            entry("AcceptedCmp2", 0),
            entry("AcceptedCmp3", 0),
            entry("AcceptedCmp4", 0),
            entry("AcceptedCmp5", 0)
    );

    // Minimum required columns for clustering
    public static final List<String> MINIMUM_REQUIRED_COLUMNS = Arrays.asList(
            "Income", "MntWines", "NumWebPurchases"
    );
}
