package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Marketplace
import com.example.ui.theme.AmazonOrange
import com.example.ui.theme.FlipkartBlue
import com.example.ui.theme.MeeshoPink
import com.example.ui.theme.SainiBorder
import com.example.ui.theme.SainiDarkHeader
import com.example.ui.theme.SainiSurfaceWhite

@Composable
fun MarketplaceFilterRow(
    selectedMarketplace: Marketplace?,
    onSelectMarketplace: (Marketplace?) -> Unit,
    modifier: Modifier = Modifier
) {
    val marketplaces = listOf(
        null to "All Stores",
        Marketplace.AMAZON to "Amazon",
        Marketplace.FLIPKART to "Flipkart",
        Marketplace.MEESHO to "Meesho"
    )

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        marketplaces.forEach { (market, label) ->
            val isSelected = selectedMarketplace == market
            val indicatorColor = when (market) {
                Marketplace.AMAZON -> AmazonOrange
                Marketplace.FLIPKART -> FlipkartBlue
                Marketplace.MEESHO -> MeeshoPink
                else -> Color(0xFF64748B)
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (isSelected) SainiDarkHeader else SainiSurfaceWhite)
                    .border(
                        width = 1.dp,
                        color = if (isSelected) indicatorColor else SainiBorder,
                        shape = RoundedCornerShape(10.dp)
                    )
                    .clickable { onSelectMarketplace(market) }
                    .padding(vertical = 7.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    if (market != null) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(indicatorColor)
                        )
                        Box(modifier = Modifier.padding(start = 5.dp))
                    }
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else Color(0xFF475569)
                    )
                }
            }
        }
    }
}
