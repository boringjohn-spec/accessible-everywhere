package com.example

import androidx.compose.runtime.Composable
import androidx.compose.material3.*

@Composable
fun Screen(status: String) {
  IconButton(onClick = { share() }) { Icon(Icons.Default.Share, contentDescription = null) }
  Text("Total", fontSize = 14.dp)
  Icon(Icons.Default.Search, contentDescription = "Search button")
  Box(Modifier.clickable { open() })
  Text(status, Modifier.semantics { liveRegion = LiveRegionMode.Assertive })
  SwipeToDismissBox(state = state, backgroundContent = {}) { Row {} }
}
