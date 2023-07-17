const http = require('http');

const animationScript = `
<script>
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 5,
        radius: 10,
        color: "red"
    };

    function drawBall() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
    }

    function updateBall() {
        ball.x += ball.vx;
        if ((ball.x + ball.radius) > canvas.width || (ball.x - ball.radius) < 0) {
            ball.vx = -ball.vx;
        }
    }

    function animate() {
        drawBall();
        updateBall();
        requestAnimationFrame(animate);
    }

    animate();
</script>
`

const mainPageServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');

  if (req.url === '/') {
    res.end(`
    <!DOCTYPE html>
    <html>
        <head>
            <title>Prevent Canvas Animation Blocking with IFrames: An OffscreenCanvas Alternative</title>
            <style>
                body {
                    font-family: sans-serif;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <h1>Prevent Canvas Animation Blocking with IFrames: An OffscreenCanvas Alternative</h1>
            <p>
                This example demonstrates how to implement a canvas animation in a separate JavaScript execution context - an iframe - that can run independently from the parent document's main thread. This approach ensures that, even if the main thread in the parent document is blocked or busy, the iframe's animation continues to run smoothly.
            </p>
            
            <button id="freeze">Freeze for 3 seconds</button>
            <button id="sendToIframe">Send data to iframe</button>
            <canvas id="canvas" width="300" height="21"></canvas>
            <div id="parent-messages"></div>

            <br />
          
            <iframe id="iframe" src="http://localhost:5000" width="100%" height="300"></iframe>

            <h2>Explaination</h2>
            
            <h3>Animation Inside an Iframe</h3>
            <p>
                Both the parent document and the child iframe have a canvas running a bouncing ball animation. The animation's logic is executed independently in each context. Therefore, even if the parent's main JavaScript thread experiences lag or freezes, the animation inside the iframe remains unaffected.
            </p>
            <h3>Inter-Context Communication</h3>
            <p>
                Communication between the parent document and the iframe is enabled via the postMessage() method and 'message' event listeners. This functionality allows for the sending and receiving of data between the two separate JavaScript execution contexts, demonstrating not just independence, but also interactivity and communication capabilities between them.
            </p>
            <h3>Practical Benefits</h3>
            <p>
                This approach is particularly useful for running scripts requiring DOM access, such as those involving video textures. Such use cases might not be compatible with solutions like Web Workers or OffscreenCanvas, which do not have access to the DOM. Running such scripts inside an iframe can provide a way around these limitations.
            </p>
            <p>
                Importantly, this method ensures the continuity of animations in scenarios where the parent document's main thread experiences lag or is blocked. By running animations in a separate context (the iframe), they are protected from disturbances in the parent document. This is particularly useful in cases where continuous, smooth animations are crucial, and disruptions in response to UI updates are not acceptable.
            </p>
            <h3>Comparison with OffscreenCanvas</h3>
            <p>
                OffscreenCanvas is a popular technique used to run canvas animations in a worker, separate from the main thread. This technique improves performance by moving potentially resource-intensive operations away from the main thread. However, there's a notable limitation - the worker does not have access to the DOM. This restriction makes OffscreenCanvas unsuitable for certain scenarios, such as rendering video textures or any other operation requiring direct DOM interaction.
            </p>
            <p>
                Using an iframe as an alternative context, as demonstrated in this example, provides a workaround. While the animation runs in a separate context similar to OffscreenCanvas, it retains access to the DOM. Furthermore, the blocking or lagging of the parent document's main thread does not affect the animation in the iframe, maintaining the smoothness of the animation. Additionally, the iframe approach enables inter-context communication, allowing for data exchange between the parent document and the iframe. As such, the iframe method offers a more flexible alternative to OffscreenCanvas for specific use cases.
            </p>
            <h3>Challenges</h3>
            <p>
                While this method provides significant benefits, it does introduce additional complexity, particularly around deployment. Separate contexts require separate deployment and hosting, which can increase operational complexity and resources. Additionally, cross-origin resource sharing (CORS) policies can pose challenges, as these may need to be adjusted to allow the parent document and the iframe to communicate effectively.
            </p>
            <p>
                It's also important to consider that while the animation in the iframe runs smoothly even when the parent's thread is blocked, the overall user experience might still be affected. For example, any UI components in the parent document would also freeze, which could lead to user frustration. Therefore, this method should be used thoughtfully as part of a broader performance optimization strategy.
            </p>

            ${animationScript}
           
            <script>
                function blockThreadForSeconds(seconds) {
                    var now = new Date().getTime();
                    while(true) {
                        if ((new Date().getTime() - now) >= seconds*1000) {
                            break;
                        }
                    }
                }

                document.getElementById('freeze').addEventListener('click', () => {
                    blockThreadForSeconds(3);
                });

                document.getElementById('sendToIframe').addEventListener('click', () => {
                    const iframe = document.getElementById('iframe');
                    iframe.contentWindow.postMessage({
                        source: 'parent',
                        type: 'message',
                        data: 'Hello from parent!'
                    }, '*');
                });

                window.addEventListener('message', event => {
                    if (typeof event.data === 'object' &&
                        event.data.source === 'iframe' &&
                        event.data.type === 'message') {
                        const parentMessages = document.getElementById('parent-messages');
                        const message = document.createElement('p');
                        message.textContent = 'Received: ' + event.data.data;
                        parentMessages.appendChild(message);
                    }
                });
            </script>
        </body>
    </html>

    `);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

mainPageServer.listen(4999, () => {
  console.log('Main page server listening on port 4999');
});

const iframeServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');

  if (req.url === '/') {
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Child Iframe</title>
          <style>
            body {
                font-family: sans-serif;
            }
        </style>
        </head>
        <body>
          <h3>Child Iframe</h3>
          <button onclick="postMessageToParent()">Post Message to Parent</button>

          <canvas id="canvas" width="300" height="21"></canvas>

          <div id="iframe-messages"></div>

          ${animationScript}

          <script>
            function postMessageToParent() {
                window.parent.postMessage({
                source: 'iframe',
                type: 'message',
                data: 'Hello from iframe!'
                }, '*');
            }
            window.addEventListener('message', event => {
                if (typeof event.data === 'object' &&
                    event.data.source === 'parent' &&
                    event.data.type === 'message') {
                    const iframeMessages = document.getElementById('iframe-messages');
                    const message = document.createElement('p');
                    message.textContent = 'Received: ' + event.data.data;
                    iframeMessages.appendChild(message);
                }
            });
          </script>
        </body>
      </html>
    `);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

iframeServer.listen(5000, () => {
  console.log('Iframe server listening on port 5000');
});
