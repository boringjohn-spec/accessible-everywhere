import SwiftUI
import UIKit

struct ContentView: View {
  var body: some View {
    VStack {
      Text("Balance").font(.system(size: 15))
      Text("Total").font(.custom("Brand", fixedSize: 17))
      Image("hero")
      Text("Buy").onTapGesture { buy() }
      Text("A very long title").lineLimit(1)
      Button(action: play) { Image(systemName: "play") }
        .accessibilityLabel("Play button")
    }
    .dynamicTypeSize(...DynamicTypeSize.large)
  }
}

final class Legacy: UIViewController {
  let label = UILabel()
  override func viewDidLoad() { label.font = UIFont.systemFont(ofSize: 14) }
}
