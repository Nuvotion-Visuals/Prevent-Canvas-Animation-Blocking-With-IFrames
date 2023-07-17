# Prevent Canvas Animation Blocking with IFrames: An OffscreenCanvas Alternative

This example demonstrates how to implement a canvas animation in a separate JavaScript execution context - an iframe - that can run independently from the parent document's main thread. This approach ensures that, even if the main thread in the parent document is blocked or busy, the iframe's animation continues to run smoothly.

## Getting started

1. `git clone https://github.com/AVsync-LIVE/Prevent-Canvas-Animation-Blocking-With-IFrames.git`
2. `node index.js` or `docker compose up -d`
3. Visit `http://localhost:4999`

## Explanation

### Animation Inside an Iframe

Both the parent document and the child iframe have a canvas running a bouncing ball animation. The animation's logic is executed independently in each context. Therefore, even if the parent's main JavaScript thread experiences lag or freezes, the animation inside the iframe remains unaffected.

### Inter-Context Communication

Communication between the parent document and the iframe is enabled via the `postMessage()` method and 'message' event listeners. This functionality allows for the sending and receiving of data between the two separate JavaScript execution contexts, demonstrating not just independence, but also interactivity and communication capabilities between them.

### Practical Benefits

This approach is particularly useful for running scripts requiring DOM access, such as those involving video textures. Such use cases might not be compatible with solutions like Web Workers or OffscreenCanvas, which do not have access to the DOM. Running such scripts inside an iframe can provide a way around these limitations.

Importantly, this method ensures the continuity of animations in scenarios where the parent document's main thread experiences lag or is blocked. By running animations in a separate context (the iframe), they are protected from disturbances in the parent document. This is particularly useful in cases where continuous, smooth animations are crucial, and disruptions in response to UI updates are not acceptable.

### Comparison with OffscreenCanvas

OffscreenCanvas is a popular technique used to run canvas animations in a worker, separate from the main thread. This technique improves performance by moving potentially resource-intensive operations away from the main thread. However, there's a notable limitation - the worker does not have access to the DOM. This restriction makes OffscreenCanvas unsuitable for certain scenarios, such as rendering video textures or any other operation requiring direct DOM interaction.

Using an iframe as an alternative context, as demonstrated in this example, provides a workaround. While the animation runs in a separate context similar to OffscreenCanvas, it retains access to the DOM. Furthermore, the blocking or lagging of the parent document's main thread does not affect the animation in the iframe, maintaining the smoothness of the animation. Additionally, the iframe approach enables inter-context communication, allowing for data exchange between the parent document and the iframe. As such, the iframe method offers a more flexible alternative to OffscreenCanvas for specific use cases.

### Challenges

While this method provides significant benefits, it does introduce additional complexity, particularly around deployment. Separate contexts require separate deployment and hosting, which can increase operational complexity and resources. Additionally, cross-origin resource sharing (CORS) policies can pose challenges, as these may need to be adjusted to allow the parent document and the iframe to communicate effectively.

It's also important to consider that while the animation in the iframe runs smoothly even when the parent's thread is blocked, the overall user experience might still be affected. For example, any UI components in the parent document would also freeze, which could lead to user frustration. Therefore, this method should be used thoughtfully as part of a broader performance optimization strategy.
