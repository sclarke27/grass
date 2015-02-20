Grass.gCharacterList = [];

Grass.gCharacterList['brownBird'] = {
    name: "Brown Bird",
    width: 3,
    height: 3,
    isPlayable: true,
    sprite: {
        imgSrc: Grass.kImgFolder + 'brownBird.png',
        width: 65,
        height: 65,
        offsetX: 0,
        offsetY: 0,
        frames: 5,
        duration: 400
    },
    keybindings: [
        [Grass.kKeys.W, 'up' ],
        [Grass.kKeys.S, 'down' ],
        [Grass.kKeys.A, 'left' ],
        [Grass.kKeys.D, 'right' ]
    ]
}

