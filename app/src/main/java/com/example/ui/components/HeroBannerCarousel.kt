package com.example.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.model.HeroItem
import com.example.ui.theme.SainiDarkHeader
import com.example.ui.theme.SainiRoseJaipur
import com.example.ui.theme.SainiSaffron
import com.example.ui.theme.SainiSaffronDark
import kotlinx.coroutines.delay

@Composable
fun HeroBannerCarousel(
    heroItems: List<HeroItem>,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val items = if (heroItems.isNotEmpty()) heroItems else listOf(
        HeroItem(
            imageUrl = "",
            colorCode = "",
            titleText = "SAINIWALAA DEALS — हर दिन कुछ नया, हर खरीदारी में बचत!\nAmazon, Flipkart & Meesho Best Deals",
            link = "",
            show = true,
            rowIndex = 1
        )
    )

    val pagerState = rememberPagerState(pageCount = { items.size })

    // Auto-advance banner smoothly every 4.5 seconds
    LaunchedEffect(items.size) {
        if (items.size > 1) {
            while (true) {
                delay(4500)
                val nextPage = (pagerState.currentPage + 1) % items.size
                pagerState.animateScrollToPage(nextPage)
            }
        }
    }

    Column(modifier = modifier.fillMaxWidth()) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .height(175.dp)
                .padding(horizontal = 16.dp)
        ) { page ->
            val hero = items[page]
            Card(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(16.dp))
                    .clickable {
                        if (hero.link.isNotBlank()) {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(hero.link))
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                // Ignore invalid URLs
                            }
                        }
                    },
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    if (hero.imageUrl.isNotBlank()) {
                        AsyncImage(
                            model = ImageRequest.Builder(context)
                                .data(hero.imageUrl)
                                .crossfade(true)
                                .build(),
                            contentDescription = hero.titleText.ifBlank { "Featured Deal Banner" },
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        // Gradient scrim for readability if text overlay exists
                        if (hero.titleText.isNotBlank()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(
                                        Brush.verticalGradient(
                                            colors = listOf(
                                                Color.Transparent,
                                                Color(0xCC0F172A)
                                            )
                                        )
                                    )
                            )
                        }
                    } else {
                        // Fallback Royal Jaipur Gradient Card
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.linearGradient(
                                        colors = listOf(
                                            SainiDarkHeader,
                                            Color(0xFF1E293B),
                                            SainiSaffronDark
                                        )
                                    )
                                )
                        )
                    }

                    // Content overlay
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Bottom
                    ) {
                        // Badge
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(SainiRoseJaipur)
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocalOffer,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "EXCLUSIVE OFFER",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        val displayTitle = if (hero.titleText.isNotBlank()) {
                            hero.titleText.lines().firstOrNull { it.isNotBlank() } ?: hero.titleText
                        } else {
                            "Top Shopping Offers Across Amazon, Flipkart & Meesho"
                        }

                        Text(
                            text = displayTitle,
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        if (hero.link.isNotBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Grab Deal Now",
                                    color = SainiSaffron,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = null,
                                    tint = SainiSaffron,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Pager indicator dots
        if (items.size > 1) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                repeat(items.size) { iteration ->
                    val color = if (pagerState.currentPage == iteration) SainiSaffron else Color(0xFFCBD5E1)
                    val width = if (pagerState.currentPage == iteration) 16.dp else 6.dp
                    Box(
                        modifier = Modifier
                            .padding(2.dp)
                            .clip(CircleShape)
                            .background(color)
                            .size(width = width, height = 6.dp)
                    )
                }
            }
        }
    }
}
