
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Sandbox 1.0</title>
</head>
<body>
    <link rel="shortcut icon" href="textures/Icon.ico" type="image/ico"/>
    <audio id="audio1" src="audio/Stone.mp3" preload="auto"></audio>
    <div style="position:absolute; top:32px; left:32px;">
        <div style="position:absolute; top:0px; left:0px;">
            <canvas id="mainCanvas" width="1024" height="1024"></canvas>
        </div>
        <div style="position:absolute; top:0px; left:1024px;">
            <canvas id="statusCanvas" width="512" height="1024"></canvas>
        </div>
     </div>
     <script defer="" src="Recipes.js"></script>
     <script defer="" src="Sandbox1.js"></script>
</body>
</html>