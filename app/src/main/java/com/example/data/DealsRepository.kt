package com.example.data

import android.content.Context
import android.util.Log
import com.example.model.DealsApiResponse
import com.example.model.FooterPage
import com.example.model.HeaderCategory
import com.example.model.HeroItem
import com.example.model.ProductItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit
import kotlin.math.roundToInt

class DealsRepository(private val context: Context) {

    private val apiUrl = "https://script.google.com/macros/s/AKfycbzA_hAO03gKPWIJ0UwhREB62hEbUusiyqZPO1_yrlmkGfOYsvnh46KZi3CC4rqANrzE/exec"
    private val cacheFileName = "deals_api_cache.json"
    private val prefs = context.getSharedPreferences("sainiwalaa_deals_prefs", Context.MODE_PRIVATE)

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    private val _dealsData = MutableStateFlow<DealsApiResponse?>(null)
    val dealsData: StateFlow<DealsApiResponse?> = _dealsData.asStateFlow()

    private val _wishlistIds = MutableStateFlow<Set<String>>(loadWishlist())
    val wishlistIds: StateFlow<Set<String>> = _wishlistIds.asStateFlow()

    init {
        // Immediately load cached data into StateFlow for instant rendering
        val cached = loadCachedResponse()
        if (cached != null) {
            _dealsData.value = cached
        }
    }

    suspend fun getDeals(forceRefresh: Boolean = false): Result<DealsApiResponse> = withContext(Dispatchers.IO) {
        // If not force refresh and we already have cached data, return cached immediately
        if (!forceRefresh && _dealsData.value != null) {
            // Trigger background refresh silently
            refreshSilently()
            return@withContext Result.success(_dealsData.value!!)
        }

        try {
            val networkResult = fetchFromNetwork()
            if (networkResult.isSuccess) {
                val data = networkResult.getOrThrow()
                saveToCache(data)
                _dealsData.value = data
                Result.success(data)
            } else {
                // If network failed, fall back to cached data
                val cached = _dealsData.value ?: loadCachedResponse()
                if (cached != null) {
                    _dealsData.value = cached
                    Result.success(cached)
                } else {
                    Result.failure(networkResult.exceptionOrNull() ?: Exception("Failed to load deals data"))
                }
            }
        } catch (e: Exception) {
            Log.e("DealsRepository", "Error loading deals", e)
            val cached = _dealsData.value ?: loadCachedResponse()
            if (cached != null) {
                _dealsData.value = cached
                Result.success(cached)
            } else {
                Result.failure(e)
            }
        }
    }

    private suspend fun refreshSilently() = withContext(Dispatchers.IO) {
        try {
            val result = fetchFromNetwork()
            if (result.isSuccess) {
                val data = result.getOrThrow()
                saveToCache(data)
                _dealsData.value = data
            }
        } catch (e: Exception) {
            Log.w("DealsRepository", "Silent refresh failed: ${e.message}")
        }
    }

    private fun fetchFromNetwork(): Result<DealsApiResponse> {
        return try {
            val request = Request.Builder()
                .url(apiUrl)
                .addHeader("Accept", "application/json")
                .get()
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    return Result.failure(Exception("HTTP error ${response.code}"))
                }
                val bodyString = response.body?.string()
                if (bodyString.isNullOrBlank()) {
                    return Result.failure(Exception("Empty response from API"))
                }
                val parsed = parseApiResponse(bodyString)
                Result.success(parsed)
            }
        } catch (e: Exception) {
            Log.e("DealsRepository", "Network fetch exception", e)
            Result.failure(e)
        }
    }

    private fun parseApiResponse(jsonString: String): DealsApiResponse {
        val root = JSONObject(jsonString)
        val success = root.optBoolean("success", true)

        val productsList = mutableListOf<ProductItem>()
        val productsArray = root.optJSONArray("products") ?: JSONArray()
        for (i in 0 until productsArray.length()) {
            val obj = productsArray.optJSONObject(i) ?: continue
            val showStr = obj.optString("SHOW", "YES").trim()
            if (showStr.equals("NO", ignoreCase = true)) {
                continue
            }

            val name = obj.optString("NAME", "").trim()
            if (name.isEmpty()) continue

            val link = obj.optString("LINK", "").trim()
            val image = obj.optString("IMAGE", "").trim()
            val market = obj.optString("MARKET", "").trim()
            val badge = obj.optString("BADGE", "").trim()
            val keywords = obj.optString("KEYWORDS", "").trim()
            val description = obj.optString("DESCRIPTION", "").trim()
            val topStr = obj.optString("TOP", "NO").trim()
            val isTop = topStr.equals("YES", ignoreCase = true)
            val rowIndex = obj.optInt("_ROW", i + 1)

            val price = parsePrice(obj.opt("PRICE"))
            val mrp = parsePrice(obj.opt("MRP"))
            val discount = parseDiscount(obj.opt("DISCOUNT"), price, mrp)
            val rating = parseRating(obj.opt("RATING"))

            val rawCategory = obj.optString("CATEGORY", "").trim()
            val categories = splitCategories(rawCategory)

            // Stable product ID
            val productId = "deal_${rowIndex}_${name.hashCode()}"

            productsList.add(
                ProductItem(
                    id = productId,
                    name = name,
                    link = link,
                    imageUrl = image,
                    market = market,
                    price = price,
                    mrp = mrp,
                    discountPercent = discount,
                    rawCategory = rawCategory,
                    categories = categories,
                    rating = rating,
                    badge = badge,
                    keywords = keywords,
                    description = description,
                    isTop = isTop,
                    show = true,
                    rowIndex = rowIndex
                )
            )
        }

        val heroList = mutableListOf<HeroItem>()
        val heroArray = root.optJSONArray("hero") ?: JSONArray()
        for (i in 0 until heroArray.length()) {
            val obj = heroArray.optJSONObject(i) ?: continue
            val showStr = obj.optString("SHOW", "YES").trim()
            if (showStr.equals("NO", ignoreCase = true)) continue

            val img = obj.optString("IMAGE", "").trim()
            val colorCode = obj.optString("COLOR CORD", "").trim()
            val text = obj.optString("TAXT", "").trim()
            val link = obj.optString("LINK", "").trim()
            val rowIndex = obj.optInt("_ROW", i + 1)

            if (img.isNotEmpty() || text.isNotEmpty()) {
                heroList.add(
                    HeroItem(
                        imageUrl = img,
                        colorCode = colorCode,
                        titleText = text,
                        link = link,
                        show = true,
                        rowIndex = rowIndex
                    )
                )
            }
        }

        val headerList = mutableListOf<HeaderCategory>()
        val headerArray = root.optJSONArray("header") ?: JSONArray()
        for (i in 0 until headerArray.length()) {
            val obj = headerArray.optJSONObject(i) ?: continue
            val showStr = obj.optString("SHOW", "YES").trim()
            if (showStr.equals("NO", ignoreCase = true)) continue

            val catName = obj.optString("CATEGORY", "").trim()
            if (catName.isEmpty()) continue

            val textInfo = obj.optString("TEXTINFO", "").trim()
            val pageLink = obj.optString("PAGELINK", "").trim()
            val icon = obj.optString("ICON", "").trim()
            val rowIndex = obj.optInt("_ROW", i + 1)

            headerList.add(
                HeaderCategory(
                    categoryName = catName,
                    textInfo = textInfo,
                    pageLink = pageLink,
                    iconUrl = icon,
                    show = true,
                    rowIndex = rowIndex
                )
            )
        }

        val footerList = mutableListOf<FooterPage>()
        val footerArray = root.optJSONArray("footer") ?: JSONArray()
        for (i in 0 until footerArray.length()) {
            val obj = footerArray.optJSONObject(i) ?: continue
            val showStr = obj.optString("SHOW", "YES").trim()
            if (showStr.equals("NO", ignoreCase = true)) continue

            val pageName = obj.optString("PAGE NAME", "").trim()
            val content = obj.optString("CONTENT", "").trim()
            val rowIndex = obj.optInt("_ROW", i + 1)

            if (pageName.isNotEmpty()) {
                footerList.add(
                    FooterPage(
                        pageName = pageName,
                        content = content,
                        show = true,
                        rowIndex = rowIndex
                    )
                )
            }
        }

        return DealsApiResponse(
            success = success,
            products = productsList,
            hero = heroList,
            header = headerList,
            footer = footerList
        )
    }

    private fun parsePrice(value: Any?): Double {
        if (value == null) return 0.0
        val str = value.toString().replace("₹", "").replace(",", "").trim()
        return str.toDoubleOrNull() ?: 0.0
    }

    private fun parseDiscount(discountValue: Any?, price: Double, mrp: Double): Int {
        if (discountValue != null) {
            val str = discountValue.toString().replace("%", "").trim()
            val num = str.toDoubleOrNull()
            if (num != null) {
                return if (num <= 1.0 && num > 0.0) {
                    (num * 100).roundToInt()
                } else {
                    num.roundToInt()
                }
            }
        }
        // If discount is missing but MRP and PRICE are available, calculate
        if (mrp > price && price > 0) {
            val calculated = ((mrp - price) / mrp) * 100
            return calculated.roundToInt().coerceIn(0, 99)
        }
        return 0
    }

    private fun parseRating(value: Any?): Double {
        if (value == null) return 4.0
        val str = value.toString().trim()
        val num = str.toDoubleOrNull() ?: 4.0
        return num.coerceIn(1.0, 5.0)
    }

    private fun splitCategories(catStr: String): List<String> {
        if (catStr.isBlank()) return listOf("All Deals")
        // Split by |, ,, >, /, \
        val delimiters = charArrayOf('|', ',', '>', '/', '\\')
        val list = catStr.split(*delimiters)
            .map { it.trim() }
            .filter { it.isNotEmpty() }
        return if (list.isEmpty()) listOf("All Deals") else list
    }

    private fun saveToCache(data: DealsApiResponse) {
        try {
            val cacheFile = File(context.cacheDir, cacheFileName)
            val json = JSONObject().apply {
                put("cachedAt", System.currentTimeMillis())
                val prodArr = JSONArray()
                data.products.forEach { p ->
                    prodArr.put(JSONObject().apply {
                        put("NAME", p.name)
                        put("LINK", p.link)
                        put("IMAGE", p.imageUrl)
                        put("MARKET", p.market)
                        put("PRICE", p.price)
                        put("MRP", p.mrp)
                        put("DISCOUNT", p.discountPercent)
                        put("CATEGORY", p.rawCategory)
                        put("RATING", p.rating)
                        put("BADGE", p.badge)
                        put("KEYWORDS", p.keywords)
                        put("DESCRIPTION", p.description)
                        put("TOP", if (p.isTop) "YES" else "NO")
                        put("SHOW", "YES")
                        put("_ROW", p.rowIndex)
                    })
                }
                put("products", prodArr)

                val heroArr = JSONArray()
                data.hero.forEach { h ->
                    heroArr.put(JSONObject().apply {
                        put("IMAGE", h.imageUrl)
                        put("COLOR CORD", h.colorCode)
                        put("TAXT", h.titleText)
                        put("LINK", h.link)
                        put("SHOW", "YES")
                        put("_ROW", h.rowIndex)
                    })
                }
                put("hero", heroArr)

                val headArr = JSONArray()
                data.header.forEach { hd ->
                    headArr.put(JSONObject().apply {
                        put("CATEGORY", hd.categoryName)
                        put("TEXTINFO", hd.textInfo)
                        put("PAGELINK", hd.pageLink)
                        put("ICON", hd.iconUrl)
                        put("SHOW", "YES")
                        put("_ROW", hd.rowIndex)
                    })
                }
                put("header", headArr)

                val footArr = JSONArray()
                data.footer.forEach { f ->
                    footArr.put(JSONObject().apply {
                        put("PAGE NAME", f.pageName)
                        put("CONTENT", f.content)
                        put("SHOW", "YES")
                        put("_ROW", f.rowIndex)
                    })
                }
                put("footer", footArr)
            }
            cacheFile.writeText(json.toString())
        } catch (e: Exception) {
            Log.w("DealsRepository", "Failed to cache deals to disk: ${e.message}")
        }
    }

    private fun loadCachedResponse(): DealsApiResponse? {
        return try {
            val cacheFile = File(context.cacheDir, cacheFileName)
            if (!cacheFile.exists()) return null
            val text = cacheFile.readText()
            if (text.isBlank()) return null
            parseApiResponse(text)
        } catch (e: Exception) {
            Log.w("DealsRepository", "Failed to read cached deals: ${e.message}")
            null
        }
    }

    // Wishlist functions
    fun toggleWishlist(productId: String) {
        val current = _wishlistIds.value.toMutableSet()
        if (current.contains(productId)) {
            current.remove(productId)
        } else {
            current.add(productId)
        }
        _wishlistIds.value = current
        prefs.edit().putStringSet("saved_wishlist", current).apply()
    }

    private fun loadWishlist(): Set<String> {
        return prefs.getStringSet("saved_wishlist", emptySet()) ?: emptySet()
    }
}
