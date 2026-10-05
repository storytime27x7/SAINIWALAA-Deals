package com.example.ranking

import com.example.model.Marketplace
import com.example.model.ProductItem
import java.util.Locale

object DealRankingEngine {

    /**
     * Ranks products based on search query, category, marketplace filter, and smart scoring.
     */
    fun rankProducts(
        products: List<ProductItem>,
        query: String = "",
        categoryFilter: String? = null,
        marketplaceFilter: Marketplace? = null,
        collectionFilter: DealCollection = DealCollection.ALL
    ): List<ProductItem> {
        val trimmedQuery = normalize(query)

        // 1. Filter by category
        val categoryFiltered = if (categoryFilter.isNullOrBlank() || categoryFilter.equals("All", ignoreCase = true) || categoryFilter.equals("All Deals", ignoreCase = true)) {
            products
        } else {
            products.filter { p ->
                p.categories.any { it.equals(categoryFilter, ignoreCase = true) } ||
                p.rawCategory.contains(categoryFilter, ignoreCase = true)
            }
        }

        // 2. Filter by marketplace
        val marketFiltered = if (marketplaceFilter == null) {
            categoryFiltered
        } else {
            categoryFiltered.filter { it.marketplace == marketplaceFilter }
        }

        // 3. Filter by Deal Collection
        val collectionFiltered = when (collectionFilter) {
            DealCollection.ALL -> marketFiltered
            DealCollection.TOP_PICKS -> marketFiltered.filter { it.isTop }
            DealCollection.BEST_DISCOUNTS -> marketFiltered.filter { it.discountPercent >= 40 }
            DealCollection.UNDER_500 -> marketFiltered.filter { it.price in 1.0..500.0 }
            DealCollection.TRENDING -> marketFiltered.filter { it.isTop || it.discountPercent >= 30 }
        }

        // 4. Rank items
        return if (trimmedQuery.isBlank()) {
            rankDefault(collectionFiltered)
        } else {
            rankWithSearch(collectionFiltered, trimmedQuery)
        }
    }

    private fun rankDefault(items: List<ProductItem>): List<ProductItem> {
        return items.sortedWith(
            compareByDescending<ProductItem> { if (it.isTop) 1 else 0 }
                .thenByDescending { it.discountPercent }
                .thenByDescending { it.rating }
                .thenByDescending { it.badge.isNotEmpty() }
                .thenBy { it.rowIndex }
        )
    }

    private fun rankWithSearch(items: List<ProductItem>, query: String): List<ProductItem> {
        val queryTokens = query.split("\\s+".toRegex()).filter { it.isNotBlank() }

        // Check for price intent like "under 500", "below 1000", "under 999"
        var maxPriceFilter: Double? = null
        val underMatch = Regex("""(under|below|less than)\s*(\d+)""").find(query)
        if (underMatch != null) {
            maxPriceFilter = underMatch.groupValues[2].toDoubleOrNull()
        }

        val scored = items.mapNotNull { product ->
            if (maxPriceFilter != null && product.price > maxPriceFilter) {
                return@mapNotNull null
            }

            var score = 0.0

            val nameNorm = normalize(product.name)
            val keywordsNorm = normalize(product.keywords)
            val descNorm = normalize(product.description)
            val catNorm = normalize(product.rawCategory)
            val marketNorm = normalize(product.market)

            // 1. Exact match on full query
            if (nameNorm.contains(query)) {
                score += 150.0
            }
            if (keywordsNorm.contains(query)) {
                score += 80.0
            }
            if (catNorm.contains(query)) {
                score += 60.0
            }

            // 2. Token matches
            var matchedTokens = 0
            for (token in queryTokens) {
                if (token in listOf("under", "below", "less", "than", "ke", "ka", "ki", "aur", "the")) continue

                var matched = false
                if (nameNorm.contains(token)) {
                    score += 50.0
                    matched = true
                }
                if (keywordsNorm.contains(token)) {
                    score += 30.0
                    matched = true
                }
                if (catNorm.contains(token)) {
                    score += 25.0
                    matched = true
                }
                if (marketNorm.contains(token)) {
                    score += 20.0
                    matched = true
                }
                if (descNorm.contains(token)) {
                    score += 10.0
                    matched = true
                }

                if (matched) matchedTokens++
            }

            // If query tokens were present but none matched, filter out
            val significantTokens = queryTokens.filterNot { it in listOf("under", "below", "less", "than", "ke", "ka", "ki", "aur", "the") }
            if (significantTokens.isNotEmpty() && matchedTokens == 0 && maxPriceFilter == null) {
                return@mapNotNull null
            }

            // 3. Modifiers: Top products boost
            if (product.isTop) score += 15.0

            // 4. Higher discount boost (up to +20 points)
            score += (product.discountPercent / 5.0).coerceAtMost(20.0)

            // 5. Rating boost (up to +10 points)
            score += (product.rating * 2.0).coerceAtMost(10.0)

            // 6. Completeness boost
            if (product.imageUrl.isNotBlank()) score += 5.0
            if (product.price > 0) score += 5.0
            if (product.badge.isNotBlank()) score += 3.0

            Pair(product, score)
        }

        return scored
            .sortedWith(
                compareByDescending<Pair<ProductItem, Double>> { it.second }
                    .thenByDescending { it.first.discountPercent }
                    .thenBy { it.first.rowIndex }
            )
            .map { it.first }
    }

    private fun normalize(str: String): String {
        return str.lowercase(Locale.ROOT)
            .replace("[^a-z0-9\\s]".toRegex(), " ")
            .trim()
            .replace("\\s+".toRegex(), " ")
    }
}

enum class DealCollection(val label: String) {
    ALL("All Deals"),
    TRENDING("Trending Deals"),
    TOP_PICKS("Top Picks"),
    BEST_DISCOUNTS("Best Discounts"),
    UNDER_500("Under ₹500")
}
