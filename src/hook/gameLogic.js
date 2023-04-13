//全局参数引入
import * as $ from "jquery";
import { SCREEN, DIRECT, ENEMY_LOCATION, KEYBOARD, TAGS, STATE, PICTURES, POS } from "@/hook/globalParams";
const { SCREEN_HEIGHT, SCREEN_WIDTH } = SCREEN;
const { UP, DOWN, LEFT, RIGHT } = DIRECT
const { WALL } = TAGS
const { GAME_STATE_MENU, GAME_STATE_INIT, } = STATE
const { RESOURCE_IMAGE } = PICTURES()

//类引入
import { Menu } from "@/gameClass/menu";
import { Stage } from "@/gameClass/stage";
import { Map } from "@/gameClass/map";
import { PlayTank } from "@/gameClass/tank";
import { EnemyOne, EnemyTwo, EnemyThree } from "@/gameClass/tank";
import { Prop } from "@/gameClass/prop";
//初始化地图
export const initMap = function (gameInstance) {
    gameInstance.map.setMapLevel(gameInstance.level);
    gameInstance.map.draw();
    drawLives(gameInstance);
}
//绘制坦克生命数
const drawLives = function (gameInstance) {
    gameInstance.map.drawLives(gameInstance.player1.lives, 1);
    gameInstance.map.drawLives(gameInstance.player2.lives, 2);
}
//添加坦克，并不是实际绘制，只是对坦克数组进行添加
const addEnemyTank = function (gameInstance) {
    //边界条件判断
    if (gameInstance.enemyArray == null || gameInstance.enemyArray.length >= gameInstance.maxAppearEnemy || gameInstance.maxEnemy == 0) {
        return;
    }
    gameInstance.appearEnemy++;
    //随机生成三种类型坦克
    var rand = parseInt(Math.random() * 3);
    var obj = null;
    if (rand == 0) {
        obj = new EnemyOne(gameInstance);
    } else if (rand == 1) {
        obj = new EnemyTwo(gameInstance);
    } else if (rand == 2) {
        obj = new EnemyThree(gameInstance);
    }
    //随机重生点
    obj.x = ENEMY_LOCATION[parseInt(Math.random() * 3)] + gameInstance.map.offsetX;
    obj.y = gameInstance.map.offsetY;
    obj.dir = DOWN;
    //添加坦克对象到坦克数组中
    gameInstance.enemyArray[gameInstance.enemyArray.length] = obj;
    //更新地图右侧坦克数
    gameInstance.map.clearEnemyNum(gameInstance.maxEnemy, gameInstance.appearEnemy);
}
//绘制敌方坦克s//调用了坦克类的draw方法
const drawEnemyTanks = function (gameInstance) {
    //边界条件判断
    if (gameInstance.enemyArray != null || gameInstance.enemyArray.length > 0) {
        for (var i = 0; i < gameInstance.enemyArray.length; i++) {
            var enemyObj = gameInstance.enemyArray[i];
            if (enemyObj.isDestroyed) {
                gameInstance.enemyArray.removeByIndex(i);
                i--;
            } else {
                enemyObj.draw();
            }
        }
    }
    if (gameInstance.emenyStopTime > 0) {
        gameInstance.emenyStopTime--;
    }
}
//绘制子弹
const drawBullet = function (gameInstance) {
    if (gameInstance.bulletArray != null && gameInstance.bulletArray.length > 0) {
        for (var i = 0; i < gameInstance.bulletArray.length; i++) {
            var bulletObj = gameInstance.bulletArray[i];
            if (bulletObj.isDestroyed) {
                bulletObj.owner.isShooting = false;
                gameInstance.bulletArray.removeByIndex(i);
                i--;
            } else {
                bulletObj.draw();
            }
        }
    }
}
//绘制爆炸
const drawCrack = function (gameInstance) {
    if (gameInstance.crackArray != null && gameInstance.crackArray.length > 0) {
        for (var i = 0; i < gameInstance.crackArray.length; i++) {
            var crackObj = gameInstance.crackArray[i];
            if (crackObj.isOver) {
                gameInstance.crackArray.removeByIndex(i);
                i--;
                if (crackObj.owner == gameInstance.player1) {
                    gameInstance.player1.renascenc(1);
                } else if (crackObj.owner == gameInstance.player2) {
                    gameInstance.player2.renascenc(2);
                }
            } else {
                crackObj.draw();
            }
        }
    }
}
//键盘事件
function keyEvent(gameInstance) {
    //console.log(gameInstance.player1);
    if (gameInstance.keys.contain(KEYBOARD.W)) {
        gameInstance.player1.dir = UP;
        gameInstance.player1.hit = false;
        gameInstance.player1.move();
    } else if (gameInstance.keys.contain(KEYBOARD.S)) {
        gameInstance.player1.dir = DOWN;
        gameInstance.player1.hit = false;
        gameInstance.player1.move();
    } else if (gameInstance.keys.contain(KEYBOARD.A)) {
        gameInstance.player1.dir = LEFT;
        gameInstance.player1.hit = false;
        gameInstance.player1.move();
    } else if (gameInstance.keys.contain(KEYBOARD.D)) {
        gameInstance.player1.dir = RIGHT;
        gameInstance.player1.hit = false;
        gameInstance.player1.move();
    }

    if (gameInstance.keys.contain(KEYBOARD.UP)) {
        gameInstance.player2.dir = UP;
        gameInstance.player2.hit = false;
        gameInstance.player2.move();
    } else if (gameInstance.keys.contain(KEYBOARD.DOWN)) {
        gameInstance.player2.dir = DOWN;
        gameInstance.player2.hit = false;
        gameInstance.player2.move();
    } else if (gameInstance.keys.contain(KEYBOARD.LEFT)) {
        gameInstance.player2.dir = LEFT;
        gameInstance.player2.hit = false;
        gameInstance.player2.move();
    } else if (gameInstance.keys.contain(KEYBOARD.RIGHT)) {
        gameInstance.player2.dir = RIGHT;
        gameInstance.player2.hit = false;
        gameInstance.player2.move();
    }

}
//绘制道具
function drawProp(gameInstance) {
    var rand = Math.random();
    if (rand < 0.4 && gameInstance.prop == null) {
        gameInstance.prop = new Prop(gameInstance);
        gameInstance.prop.init();
    }
    if (gameInstance.prop != null) {
        gameInstance.prop.draw();
        if (gameInstance.prop.isDestroyed) {
            gameInstance.prop = null;
            gameInstance.propTime = 1000;
        }
    }
}
//
function homeNoProtected(gameInstance) {
    //home周围的墙体
    var mapChangeIndex = [[23, 11], [23, 12], [23, 13], [23, 14], [24, 11], [24, 14], [25, 11], [25, 14]];
    gameInstance.map.updateMap(mapChangeIndex, WALL);
}
//绘制所有界面
export const drawAll = function (gameInstance) {
    gameInstance.tankCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (gameInstance.player1.lives > 0) {
        gameInstance.player1.draw();
    }
    if (gameInstance.player2.lives > 0) {
        gameInstance.player2.draw();
    }
    drawLives(gameInstance);
    //敌方坦克添加
    if (gameInstance.appearEnemy < gameInstance.maxEnemy) {
        //主循环20ms一次，递增mainframe到100，即2000ms，2s添加一次敌方坦克
        if (gameInstance.mainframe % 100 == 0) {
            addEnemyTank(gameInstance);
            gameInstance.mainframe = 0;
        }
        gameInstance.mainframe++;
    }
    //实际绘制敌方坦克
    drawEnemyTanks(gameInstance);
    //
    drawBullet(gameInstance);
    drawCrack(gameInstance);
    keyEvent(gameInstance);
    if (gameInstance.propTime <= 0) {
        drawProp(gameInstance);
    } else {
        gameInstance.propTime--;
    }
    if (gameInstance.homeProtectedTime > 0) {
        gameInstance.homeProtectedTime--;
    } else if (gameInstance.homeProtectedTime == 0) {
        gameInstance.homeProtectedTime = -1;
        homeNoProtected(gameInstance);
    }
}
//初始化视窗
export const initScreen = function (gameInstance) {
    //选择关卡canvas
    gameInstance.ctx = $("#stageCanvas")[0].getContext("2d");

    $("#stageCanvas").attr({ width: SCREEN_WIDTH });
    $("#stageCanvas").attr({ height: SCREEN_HEIGHT });

    gameInstance.wallCtx = $("#wallCanvas")[0].getContext("2d");
    $("#wallCanvas").attr({ width: SCREEN_WIDTH });
    $("#wallCanvas").attr({ height: SCREEN_HEIGHT });

    gameInstance.grassCtx = $("#grassCanvas")[0].getContext("2d");
    $("#grassCanvas").attr({ width: SCREEN_WIDTH });
    $("#grassCanvas").attr({ height: SCREEN_HEIGHT });

    gameInstance.tankCtx = $("#tankCanvas")[0].getContext("2d");
    $("#tankCanvas").attr({ width: SCREEN_WIDTH });
    $("#tankCanvas").attr({ height: SCREEN_HEIGHT });

    gameInstance.overCtx = $("#overCanvas")[0].getContext("2d");
    $("#overCanvas").attr({ width: SCREEN_WIDTH });
    $("#overCanvas").attr({ height: SCREEN_HEIGHT });

    $("#canvasDiv").css({ width: SCREEN_WIDTH });
    $("#canvasDiv").css({ height: SCREEN_HEIGHT });
    $("#canvasDiv").css({ "background-color": "#000000" });
}
//初始化对象
export const initObject = function (gameInstance) {
    gameInstance.menu = new Menu(gameInstance);
    gameInstance.stage = new Stage(gameInstance);
    gameInstance.map = new Map(gameInstance);

    gameInstance.player1 = new PlayTank(gameInstance);
    //玩家1出生点
    gameInstance.player1.x = 129 + gameInstance.map.offsetX;
    gameInstance.player1.y = 385 + gameInstance.map.offsetY;
    gameInstance.player2 = new PlayTank(gameInstance);
    gameInstance.player2.offsetX = 128; //player2的图片x与图片1相距128
    gameInstance.player2.x = 256 + gameInstance.map.offsetX;
    gameInstance.player2.y = 385 + gameInstance.map.offsetY;

    gameInstance.appearEnemy = 0; //已出现的敌方坦克
    gameInstance.enemyArray = []; //敌方坦克
    gameInstance.bulletArray = []; //子弹数组
    gameInstance.keys = []; //记录按下的按键
    gameInstance.crackArray = []; //爆炸数组
    gameInstance.isGameOver = false;
    gameInstance.overX = 176;
    gameInstance.overY = 384;
    gameInstance.overCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    gameInstance.emenyStopTime = 0;
    gameInstance.homeProtectedTime = -1;
    gameInstance.propTime = 1000;
}
//游戏结束
export const gameOver = function (gameInstance) {
    gameInstance.overCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    gameInstance.overCtx.drawImage(RESOURCE_IMAGE, POS["over"][0], POS["over"][1], 64, 32, gameInstance.overX + gameInstance.map.offsetX, gameInstance.overY + gameInstance.map.offsetY, 64, 32);
    gameInstance.overY -= 2;
    if (gameInstance.overY <= parseInt(gameInstance.map.mapHeight / 2)) {
        initObject(gameInstance);
        //只有一个玩家
        if (gameInstance.menu.playNum == 1) {
            gameInstance.player2.lives = 0;
        }
        gameInstance.gameState = GAME_STATE_MENU;
    }
}
//下一关卡
export const nextLevel = function (gameInstance) {
    gameInstance.level++;
    if (gameInstance.level == 22) {
        gameInstance.level = 1;
    }
    initObject(gameInstance);
    //只有一个玩家
    if (gameInstance.menu.playNum == 1) {
        gameInstance.player2.lives = 0;
    }
    gameInstance.stage.init(gameInstance.level);
    gameInstance.gameState = GAME_STATE_INIT;
}
//上一关卡
export const preLevel = function (gameInstance) {
    gameInstance.level--;
    if (gameInstance.level == 0) {
        gameInstance.level = 21;
    }
    initObject(gameInstance);
    //只有一个玩家
    if (gameInstance.menu.playNum == 1) {
        gameInstance.player2.lives = 0;
    }
    gameInstance.stage.init(gameInstance.level);
    gameInstance.gameState = GAME_STATE_INIT;
}




