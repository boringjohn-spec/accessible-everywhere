package com.example

import androidx.compose.runtime.Composable
import androidx.compose.material3.*

@Composable
fun Screen(status: String) {
  IconButton(onClick = { share() }) { Icon(Icons.Default.Share, contentDescription = "Share") }
  Text("Total", fontSize = 14.sp)
  Row { Icon(Icons.Default.Search, contentDescription = null); Text("Search") }
  Box(Modifier.clickable(role = Role.Button, onClickLabel = "Open details") { open() })
  Text(status, Modifier.semantics { liveRegion = LiveRegionMode.Polite })
  Row(Modifier.semantics { customActions = listOf(CustomAccessibilityAction("Archive") { archive(); true }) }) {}
}
