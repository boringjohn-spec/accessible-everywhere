import SwiftUI

struct ContentView: View {
  @ScaledMetric private var iconSize: CGFloat = 24

  var body: some View {
    VStack {
      Text("Balance").font(.headline)
      Text("Total").font(.custom("Brand", size: 17, relativeTo: .body))
      Image("hero").accessibilityLabel("Summer sale: 30% off all tents")
      Image(decorative: "divider")
      Button("Buy") { buy() }
      Button(action: play) { Image(systemName: "play") }
        .accessibilityLabel("Play")
    }
  }
}
