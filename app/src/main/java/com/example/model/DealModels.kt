package com.example.model

import java.text.NumberFormat
import java.util.Locale

enum class Marketplace(val displayName: String, val brandColorHex: Long) {
    AMAZON("Amazon", 0xFFFF9900),
    FLIPKART("Flipkart", 0xFF2874F0),
    MEESHO("Meesho", 0xFFF43397),
    AJIO("Ajio", 0xFF2C4152),
    MYNTRA("Myntra", 0xFFFF3F6C),
    OTHER("Deals", 0xFFF59E0B);

    companion object {
        fun from(marketStr: String?): Marketplace {
            val m = (marketStr ?: "").trim().lowercase(Locale.ROOT)
            return when {
                m.contains("amazon") -> AMAZON
                m.contains("flipkar") || m.contains("fktr") -> FLIPKART
                m.contains("meesho") -> MEESHO
                m.contains("ajio") || m.contains("ajo") -> AJIO
                m.contains("myntr") -> MYNTRA
                else -> OTHER
            }
        }
    }
}

data class ProductItem(
    val id: String,
    val name: String,
    val link: String,
    val imageUrl: String,
    val market: String,
    val price: Double,
    val mrp: Double,
    val discountPercent: Int,
    val rawCategory: String,
    val categories: List<String>,
    val rating: Double,
    val badge: String,
    val keywords: String,
    val description: String,
    val isTop: Boolean,
    val show: Boolean,
    val rowIndex: Int
) {
    val marketplace: Marketplace get() = Marketplace.from(market)

    val formattedPrice: String get() = formatIndianCurrency(price)
    val formattedMrp: String get() = if (mrp > 0) formatIndianCurrency(mrp) else ""
    val hasDiscount: Boolean get() = discountPercent > 0 && mrp > price
    val savingsAmount: Double get() = if (mrp > price) mrp - price else 0.0
    val formattedSavings: String get() = if (savingsAmount > 0) formatIndianCurrency(savingsAmount) else ""

    companion object {
        fun formatIndianCurrency(amount: Double): String {
            if (amount <= 0) return "₹0"
            return try {
                val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
                formatter.maximumFractionDigits = 0
                formatter.format(amount)
            } catch (e: Exception) {
                "₹${amount.toLong()}"
            }
        }
    }
}

data class HeroItem(
    val imageUrl: String,
    val colorCode: String,
    val titleText: String,
    val link: String,
    val show: Boolean,
    val rowIndex: Int
)

data class HeaderCategory(
    val categoryName: String,
    val textInfo: String,
    val pageLink: String,
    val iconUrl: String,
    val show: Boolean,
    val rowIndex: Int
)

data class FooterPage(
    val pageName: String,
    val content: String,
    val show: Boolean,
    val rowIndex: Int
)

data class DealsApiResponse(
    val success: Boolean,
    val products: List<ProductItem>,
    val hero: List<HeroItem>,
    val header: List<HeaderCategory>,
    val footer: List<FooterPage>
)
