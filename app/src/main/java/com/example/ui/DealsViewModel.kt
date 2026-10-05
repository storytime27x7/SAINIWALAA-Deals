package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.DealsRepository
import com.example.model.DealsApiResponse
import com.example.model.FooterPage
import com.example.model.Marketplace
import com.example.model.ProductItem
import com.example.ranking.DealCollection
import com.example.ranking.DealRankingEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface DealsUiState {
    object Loading : DealsUiState
    data class Success(val data: DealsApiResponse) : DealsUiState
    data class Error(val message: String, val hasCachedData: Boolean) : DealsUiState
}

class DealsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = DealsRepository(application.applicationContext)

    private val _uiState = MutableStateFlow<DealsUiState>(DealsUiState.Loading)
    val uiState: StateFlow<DealsUiState> = _uiState.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _selectedMarketplace = MutableStateFlow<Marketplace?>(null)
    val selectedMarketplace: StateFlow<Marketplace?> = _selectedMarketplace.asStateFlow()

    private val _selectedCollection = MutableStateFlow(DealCollection.ALL)
    val selectedCollection: StateFlow<DealCollection> = _selectedCollection.asStateFlow()

    val wishlistIds: StateFlow<Set<String>> = repository.wishlistIds

    private val _selectedProduct = MutableStateFlow<ProductItem?>(null)
    val selectedProduct: StateFlow<ProductItem?> = _selectedProduct.asStateFlow()

    private val _activeFooterPage = MutableStateFlow<FooterPage?>(null)
    val activeFooterPage: StateFlow<FooterPage?> = _activeFooterPage.asStateFlow()

    private val _showWishlist = MutableStateFlow(false)
    val showWishlist: StateFlow<Boolean> = _showWishlist.asStateFlow()

    // Filtered & Ranked products flow
    val displayedProducts: StateFlow<List<ProductItem>> = combine(
        repository.dealsData,
        _searchQuery,
        _selectedCategory,
        _selectedMarketplace,
        _selectedCollection
    ) { dealsData, query, category, market, collection ->
        val rawProducts = dealsData?.products ?: emptyList()
        DealRankingEngine.rankProducts(
            products = rawProducts,
            query = query,
            categoryFilter = category,
            marketplaceFilter = market,
            collectionFilter = collection
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Extracted categories from both Header and Products
    val allCategories: StateFlow<List<String>> = combine(
        repository.dealsData
    ) { dealsDataList ->
        val dealsData = dealsDataList[0]
        val headerCats = dealsData?.header?.map { it.categoryName.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        val productCats = dealsData?.products?.flatMap { it.categories }?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()

        val set = linkedSetOf<String>()
        set.add("All")
        set.addAll(headerCats)
        set.addAll(productCats)
        set.toList()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), listOf("All"))

    // Curated sections when no search query
    val trendingDeals: StateFlow<List<ProductItem>> = repository.dealsData.combine(_searchQuery) { data, q ->
        if (q.isNotEmpty()) emptyList()
        else {
            val list = data?.products ?: emptyList()
            list.filter { it.isTop || it.discountPercent >= 40 }.take(8)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val topPicks: StateFlow<List<ProductItem>> = repository.dealsData.combine(_searchQuery) { data, q ->
        if (q.isNotEmpty()) emptyList()
        else {
            val list = data?.products ?: emptyList()
            list.filter { it.isTop }.take(8)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val bestDiscounts: StateFlow<List<ProductItem>> = repository.dealsData.combine(_searchQuery) { data, q ->
        if (q.isNotEmpty()) emptyList()
        else {
            val list = data?.products ?: emptyList()
            list.sortedByDescending { it.discountPercent }.take(8)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val wishlistProducts: StateFlow<List<ProductItem>> = combine(
        repository.dealsData,
        repository.wishlistIds
    ) { data, wishIds ->
        val list = data?.products ?: emptyList()
        list.filter { wishIds.contains(it.id) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadDeals(force = false)
    }

    fun loadDeals(force: Boolean = false) {
        viewModelScope.launch {
            if (force) _isRefreshing.value = true
            val result = repository.getDeals(forceRefresh = force)
            _isRefreshing.value = false

            if (result.isSuccess) {
                _uiState.value = DealsUiState.Success(result.getOrThrow())
            } else {
                val cached = repository.dealsData.value
                if (cached != null) {
                    _uiState.value = DealsUiState.Success(cached)
                } else {
                    val err = result.exceptionOrNull()?.message ?: "Unable to connect to deals server"
                    _uiState.value = DealsUiState.Error(err, false)
                }
            }
        }
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
    }

    fun selectMarketplace(market: Marketplace?) {
        _selectedMarketplace.value = if (_selectedMarketplace.value == market) null else market
    }

    fun selectCollection(collection: DealCollection) {
        _selectedCollection.value = collection
    }

    fun toggleWishlist(product: ProductItem) {
        repository.toggleWishlist(product.id)
    }

    fun openProductDetail(product: ProductItem) {
        _selectedProduct.value = product
    }

    fun closeProductDetail() {
        _selectedProduct.value = null
    }

    fun openFooterPage(page: FooterPage) {
        _activeFooterPage.value = page
    }

    fun closeFooterPage() {
        _activeFooterPage.value = null
    }

    fun setShowWishlist(show: Boolean) {
        _showWishlist.value = show
    }

    fun resetFilters() {
        _searchQuery.value = ""
        _selectedCategory.value = "All"
        _selectedMarketplace.value = null
        _selectedCollection.value = DealCollection.ALL
    }
}
