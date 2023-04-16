<template>
  <!-- <div class="container"> -->
  <div class="main clearfix">
    <div id="canvasDiv">
      <canvas id="wallCanvas"></canvas>
      <canvas id="tankCanvas"></canvas>
      <canvas id="grassCanvas"></canvas>
      <canvas id="overCanvas"></canvas>
      <canvas id="stageCanvas"></canvas>
    </div>
  </div>
  <!-- </div> -->
</template>

<script>
//vue相关引入
import { onMounted, onBeforeUnmount, reactive } from "vue";
//全局参数引入
import { STATE, SOUNDS, BULLET_TYPE, KEYBOARD } from "@/hook/globalParams";
const {
  GAME_STATE_MENU,
  GAME_STATE_INIT,
  GAME_STATE_OVER,
  GAME_STATE_START,
  GAME_STATE_WIN,
} = STATE;
const { PLAYER_DESTROY_AUDIO } = SOUNDS;
const { BULLET_TYPE_PLAYER } = BULLET_TYPE;

//游戏逻辑方法引入
import {
  drawAll,
  nextLevel,
  gameOver,
  initObject,
  initScreen,
  preLevel,
} from "@/hook/gameLogic";
import { eventBus } from "./hook/eventBus";
//hook，事件总线引入
// import { eventBus } from "@/hook/eventBus";

export default {
  name: "App",
  setup() {
    //游戏全局变量
    const gameInstance = reactive({
      ctx: {}, //2d画布
      wallCtx: {}, //地图画布
      grassCtx: {}, //草地画布
      tankCtx: {}, //坦克画布
      overCtx: {}, //结束画布
      menu: null, //菜单
      stage: null, //舞台
      map: null, //地图
      player1: null, //玩家1
      player2: null, //玩家2
      prop: null,
      enemyArray: [], //敌方坦克
      bulletArray: [], //子弹数组
      keys: [], //记录按下的按键
      crackArray: [], //爆炸数组
      gameState: GAME_STATE_MENU, //默认菜单状态
      level: 1, //默认关卡等级
      maxEnemy: 20, //敌方坦克总数
      maxAppearEnemy: 5, //屏幕上一起出现的最大数
      appearEnemy: 0, //已出现的敌方坦克
      mainframe: 0,
      isGameOver: false, //游戏结束标识
      overX: 176,
      overY: 384,
      emenyStopTime: 0, //敌方坦克停止时间
      homeProtectedTime: -1,
      propTime: 300,
    });

    //事件监听
    function eventsOn() {
      //事件监听
      // eventBus.on("callInitMapFunction", () => {
      //   initMap();
      // });
      // eventBus.on("test", (msg) => {
      //   console.log("eventbus test:", msg);
      // });
    }
    //事件卸载
    function eventsOff() {
      // eventBus.off("callInitMapFunction");
      // eventBus.off("test");
    }
    //游戏循环控制
    function gameLoop() {
      switch (gameInstance.gameState) {
        case GAME_STATE_MENU:
          gameInstance.menu.draw();
          break;
        case GAME_STATE_INIT:
          gameInstance.stage.draw();
          if (gameInstance.stage.isReady == true) {
            gameInstance.gameState = GAME_STATE_START;
          }
          break;
        case GAME_STATE_START:
          drawAll(gameInstance);
          if (
            gameInstance.isGameOver ||
            (gameInstance.player1.lives <= 0 && gameInstance.player2.lives <= 0)
          ) {
            gameInstance.gameState = GAME_STATE_OVER;
            gameInstance.map.homeHit();
            PLAYER_DESTROY_AUDIO.play();
          }
          if (
            gameInstance.appearEnemy == gameInstance.maxEnemy &&
            gameInstance.enemyArray.length == 0
          ) {
            gameInstance.gameState = GAME_STATE_WIN;
          }
          break;
        case GAME_STATE_WIN:
          nextLevel(gameInstance);
          break;
        case GAME_STATE_OVER:
          gameOver(gameInstance);
          break;
      }
    }
    //键盘按下事件处理
    function keydownEventHandler(e, gameInstance, KEYBOARD) {
      //console.log(e, gameInstance, KEYBOARD);

      //console.log(gameInstance.gameState);
      switch (gameInstance.gameState) {
        case GAME_STATE_MENU:
          if (e.keyCode == KEYBOARD.ENTER) {
            gameInstance.gameState = GAME_STATE_INIT;
            // console.log("player2:", gameInstance.player2.lives);
            //只有一个玩家
            if (gameInstance.menu.playNum == 1) {
              gameInstance.player2.lives = 0;
            }
          } else {
            var n = 0;
            if (e.keyCode == KEYBOARD.DOWN) {
              n = 1;
            } else if (e.keyCode == KEYBOARD.UP) {
              n = -1;
            }
            gameInstance.menu.next(n);
          }
          break;
        case GAME_STATE_START:
          if (!gameInstance.keys.contain(e.keyCode)) {
            gameInstance.keys.push(e.keyCode);
          }
          //射击
          if (e.keyCode == KEYBOARD.SPACE && gameInstance.player1.lives > 0) {
            gameInstance.player1.shoot(BULLET_TYPE_PLAYER);
          } else if (
            e.keyCode == KEYBOARD.ENTER &&
            gameInstance.player2.lives > 0
          ) {
            gameInstance.player2.shoot(BULLET_TYPE_PLAYER);
          } else if (e.keyCode == KEYBOARD.N) {
            nextLevel(gameInstance);
          } else if (e.keyCode == KEYBOARD.P) {
            preLevel(gameInstance);
          }
          break;
      }
    }
    //键盘回上事件处理
    function keyupEventHandler(e) {
      gameInstance.keys.remove(e.keyCode);
    }
    //键盘事件监听器
    const keyEventListener = function (gameInstance, KEYBOARD) {
      //键盘按下事件
      document.addEventListener("keydown", (e) => {
        keydownEventHandler(e, gameInstance, KEYBOARD);
      });

      //键盘回上事件
      document.addEventListener("keyup", keyupEventHandler);
    };

    onMounted(() => {
      eventsOn();
      //初始化视窗
      initScreen(gameInstance);
      //初始化对象
      initObject(gameInstance);
      //游戏循环控制
      keyEventListener(gameInstance, KEYBOARD);
      setInterval(gameLoop, 20);
      //gameLoop();
      //键盘事件监听
    });

    onBeforeUnmount(() => {
      eventsOff();
    });
    /* 
    watch多个数据: 
      使用数组来指定
      如果是ref对象, 直接指定
      如果是reactive对象中的属性,  必须通过函数来指定
    */
    // watch(
    //   () => gameInstance.level,
    //   (values) => {
    //     console.log("gameInstance.level变化", values);
    //   }
    // );
    return {
      gameInstance,
    };
  },
};
</script>

<style>
#canvasDiv canvas {
  position: absolute;
}
</style>
