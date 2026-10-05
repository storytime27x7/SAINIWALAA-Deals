package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.model.ProductItem
import com.example.ranking.DealCollection
import com.example.ui.components.CategoryBar
import com.example.ui.components.EmptyStateView
import com.example.ui.components.FooterSection
import com.example.ui.components.HeaderBar
import com.example.ui.components.HeroBannerCarousel
import com.example.ui.components.InfoDialog
import com.example.ui.components.MarketplaceFilterRow
import com.example.ui.components.ProductCard
import com.example.ui.components.ProductDetailSheet
import com.example.ui.components.SkeletonLoadingView
import com.example.ui.components.WishlistDialog
import com.example.ui.theme.SainiBackgroundLight
import com.example.ui.theme.SainiBorder
import com.example.ui.theme.SainiDarkHeader
import com.example.ui.theme.SainiGoldLight
import com.example.ui.theme.SainiGoldText
import com.example.ui.theme.SainiGreenDiscount
import com.example.ui.theme.SainiRoseJaipur
import com.example.ui.theme.SainiSaffron
import com.example.ui.theme.SainiSurfaceWhite

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainDealsScreen(
    viewModel: DealsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val selectedMarketplace by viewModel.selectedMarketplace.collectAsStateWithLifecycle()
    val selectedCollection by viewModel.selectedCollection.collectAsStateWithLifecycle()
    val displayedProducts by viewModel.displayedProducts.collectAsStateWithLifecycle()
    val allCategories by viewModel.allCategories.collectAsStateWithLifecycle()
    val wishlistIds by viewModel.wishlistIds.collectAsStateWithLifecycle()
    val selectedProduct by viewModel.selectedProduct.collectAsStateWithLifecycle()
    val activeFooterPage by viewModel.activeFooterPage.collectAsStateWithLifecycle()
    val showWishlist by viewModel.showWishlist.collectAsStateWithLifecycle()
    val wishlistProducts by viewModel.wishlistProducts.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    // Back handler: dismiss dialogs or reset search query first
    BackHandler(
        enabled = selectedProduct != null || showWishlist || activeFooterPage != null || searchQuery.isNotEmpty()
    ) {
        when {
            selectedProduct != null -> viewModel.closeProductDetail()
            showWishlist -> viewModel.setShowWishlist(false)
            activeFooterPage != null -> viewModel.closeFooterPage()
            searchQuery.isNotEmpty() -> viewModel.setSearchQuery("")
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            HeaderBar(
                searchQuery = searchQuery,
                onSearchChange = { viewModel.setSearchQuery(it) },
                wishlistCount = wishlistIds.size,
                onWishlistClick = { viewModel.setShowWishlist(true) },
                isRefreshing = isRefreshing,
                onRefreshClick = { viewModel.loadDeals(force = true) }
            )
        },
        containerColor = SainiBackgroundLight
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val state = uiState) {
                is DealsUiState.Loading -> {
                    SkeletonLoadingView()
                }

                is DealsUiState.Error -> {
                    EmptyStateView(
                        title = "Connection Error",
                        subtitle = "${state.message}\nPlease check your internet connection.",
                        buttonText = "Retry",
                        onActionClick = { viewModel.loadDeals(force = true) }
                    )
                }

                is DealsUiState.Success -> {
                    val dealsData = state.data

                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 160.dp),
                        modifier = Modifier
                            .fillMaxSize()
                            .testTag("deals_grid"),
                        contentPadding = PaddingValues(bottom = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // 1. Collections Bar (Full Width Span)
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Column(modifier = Modifier.fillMaxWidth()) {
                                Spacer(modifier = Modifier.height(6.dp))

                                // Collection filters
                                LazyRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    items(DealCollection.values()) { col ->
                                        val isSel = selectedCollection == col
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(if (isSel) SainiSaffron else SainiSurfaceWhite)
                                                .border(
                                                    1.dp,
                                                    if (isSel) SainiSaffron else SainiBorder,
                                                    RoundedCornerShape(8.dp)
                                                )
                                                .clickable { viewModel.selectCollection(col) }
                                                .padding(horizontal = 12.dp, vertical = 6.dp)
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                when (col) {
                                                    DealCollection.TOP_PICKS -> Icon(
                                                        imageVector = Icons.Default.Star,
                                                        contentDescription = null,
                                                        tint = if (isSel) SainiDarkHeader else SainiSaffron,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                    DealCollection.TRENDING -> Icon(
                                                        imageVector = Icons.Default.Bolt,
                                                        contentDescription = null,
                                                        tint = if (isSel) SainiDarkHeader else SainiRoseJaipur,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                    DealCollection.BEST_DISCOUNTS -> Icon(
                                                        imageVector = Icons.Default.LocalOffer,
                                                        contentDescription = null,
                                                        tint = if (isSel) SainiDarkHeader else SainiGreenDiscount,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                    else -> {}
                                                }
                                                if (col != DealCollection.ALL && col != DealCollection.UNDER_500) {
                                                    Spacer(modifier = Modifier.size(4.dp))
                                                }
                                                Text(
                                                    text = col.label,
                                                    fontSize = 11.sp,
                                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                                    color = if (isSel) SainiDarkHeader else Color(0xFF334155)
                                                )
                                            }
                                        }
                                    }
                                }

                                // Category pills
                                CategoryBar(
                                    categories = allCategories,
                                    selectedCategory = selectedCategory,
                                    onSelectCategory = { viewModel.selectCategory(it) }
                                )

                                // Marketplace filter row (Amazon, Flipkart, Meesho)
                                MarketplaceFilterRow(
                                    selectedMarketplace = selectedMarketplace,
                                    onSelectMarketplace = { viewModel.selectMarketplace(it) }
                                )
                            }
                        }

                        // 2. Hero Banner (Full Width Span, only if no search active)
                        if (searchQuery.isBlank() && selectedCollection == DealCollection.ALL && selectedCategory.equals("All", ignoreCase = true)) {
                            item(span = { GridItemSpan(maxLineSpan) }) {
                                Column {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    HeroBannerCarousel(heroItems = dealsData.hero)
                                    Spacer(modifier = Modifier.height(10.dp))
                                }
                            }
                        }

                        // 3. Section Title / Results Summary (Full Width Span)
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                val titleText = when {
                                    searchQuery.isNotBlank() -> "Search Results for \"$searchQuery\""
                                    selectedCategory != "All" -> "$selectedCategory Deals"
                                    selectedMarketplace != null -> "${selectedMarketplace?.displayName} Exclusive Deals"
                                    selectedCollection != DealCollection.ALL -> selectedCollection.label
                                    else -> "Top Marketplace Deals"
                                }

                                Text(
                                    text = titleText,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )

                                Text(
                                    text = "${displayedProducts.size} deals",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF64748B)
                                )
                            }
                        }

                        // 4. Products Grid Items (Padding on sides handled inside or in grid)
                        if (displayedProducts.isEmpty()) {
                            item(span = { GridItemSpan(maxLineSpan) }) {
                                EmptyStateView(
                                    title = if (searchQuery.isNotBlank()) "No deals match \"$searchQuery\"" else "No deals found in this category",
                                    subtitle = "Try searching for another term like kurti, shoes, cotton, or reset your filters.",
                                    buttonText = "Reset All Filters",
                                    onActionClick = { viewModel.resetFilters() }
                                )
                            }
                        } else {
                            items(displayedProducts, key = { it.id }) { product ->
                                Box(modifier = Modifier.padding(horizontal = 8.dp)) {
                                    ProductCard(
                                        product = product,
                                        isWishlisted = wishlistIds.contains(product.id),
                                        onWishlistToggle = { viewModel.toggleWishlist(product) },
                                        onClick = { viewModel.openProductDetail(product) }
                                    )
                                }
                            }
                        }

                        // 5. Footer Section (Full Width Span)
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Spacer(modifier = Modifier.height(24.dp))
                            FooterSection(
                                footerPages = dealsData.footer,
                                onPageClick = { viewModel.openFooterPage(it) }
                            )
                        }
                    }
                }
            }
        }
    }

    // Modal Bottom Sheet: Product Detail
    if (selectedProduct != null) {
        ProductDetailSheet(
            product = selectedProduct,
            isWishlisted = wishlistIds.contains(selectedProduct?.id ?: ""),
            onWishlistToggle = {
                selectedProduct?.let { viewModel.toggleWishlist(it) }
            },
            onDismiss = { viewModel.closeProductDetail() },
            sheetState = sheetState
        )
    }

    // Dialog: Wishlist
    if (showWishlist) {
        WishlistDialog(
            wishlistProducts = wishlistProducts,
            onRemoveFromWishlist = { viewModel.toggleWishlist(it) },
            onProductClick = { viewModel.openProductDetail(it) },
            onDismiss = { viewModel.setShowWishlist(false) }
        )
    }

    // Dialog: Footer info page (About, Privacy, Disclaimer, etc.)
    if (activeFooterPage != null) {
        InfoDialog(
            page = activeFooterPage,
            onDismiss = { viewModel.closeFooterPage() }
        )
    }
}
