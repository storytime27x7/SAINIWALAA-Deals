package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val SainiColorScheme = lightColorScheme(
  primary = SainiSaffron,
  onPrimary = SainiDarkHeader,
  primaryContainer = SainiGoldLight,
  onPrimaryContainer = SainiGoldText,
  secondary = SainiRoseJaipur,
  onSecondary = SainiSurfaceWhite,
  tertiary = SainiSaffronDark,
  background = SainiBackgroundLight,
  surface = SainiSurfaceWhite,
  onBackground = SainiTextPrimary,
  onSurface = SainiTextPrimary,
  outline = SainiBorder
)

@Composable
fun SainiwalaaDealsTheme(
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = SainiColorScheme,
    typography = Typography,
    content = content
  )
}

