<template lang="pug">
div(
  class="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-300 to-green-600 select-none custom-cursor"
  :class="{ 'animate-shake': isShaking }"
)
  // 背景裝飾
  div(class="absolute inset-0 bg-[#4ade80] opacity-20 pointer-events-none", style="background-image: radial-gradient(#16a34a 2px, transparent 2px); background-size: 30px 30px;")
  
  // 主遊戲框
  div(
    class="relative w-[95%] sm:w-full max-w-[600px] border-[12px] border-amber-800 rounded-3xl bg-amber-700 shadow-[0_15px_40px_rgba(0,0,0,0.6),inset_0_10px_20px_rgba(0,0,0,0.3)] p-4 sm:p-6 z-10 flex flex-col justify-between"
  )
    // 頂部資訊列
    div(
      class="flex justify-between items-center bg-zinc-900 p-4 rounded-xl mb-6 border-b-4 border-zinc-950 shadow-inner"
    )
      div(class="text-amber-400 font-black text-xl sm:text-2xl tracking-widest uppercase [text-shadow:2px_2px_0_#000]") SCORE
        p(class="text-white text-3xl sm:text-4xl mt-1 font-mono") {{ score }}
      
      div(class="text-center")
        h1(
          class="text-3xl sm:text-4xl uppercase font-black text-rose-500 tracking-wider [text-shadow:3px_3px_0_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff,1px_1px_0_#fff]"
        ) Whack A Momiji
        
      div(class="text-sky-300 font-black text-xl sm:text-2xl tracking-widest uppercase text-right [text-shadow:2px_2px_0_#000]") TIME
        p(
          class="text-white text-3xl sm:text-4xl mt-1 font-mono transition-colors duration-300"
          :class="{ 'text-red-500 animate-pulse': countdown <= 3 && startOn }"
        ) {{ countdown }}

    // 遊戲區域
    div(
      class="grid grid-cols-3 gap-2 sm:gap-4 relative mt-4"
    )
      // 動態飄浮數字容器 (Floating Text)
      div(
        v-for="msg in floatingMessages"
        :key="msg.id"
        :id="'float-' + msg.id"
        class="absolute z-50 font-black text-4xl sm:text-5xl pointer-events-none tracking-wider opacity-100"
        :class="msg.score > 0 ? 'text-green-400' : 'text-red-500'"
        :style="{ left: msg.x + 'px', top: msg.y + 'px', textShadow: '3px 3px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' }"
      ) {{ msg.score > 0 ? '+' : '' }}{{ msg.score }}

      div(
        v-for="(momiji, index) in momijiList",
        class="aspect-square relative group",
        :class="{ 'z-30': index > 2, 'z-40': index > 5}"
      )
        // 坑洞背景
        div(
          class="z-0 absolute w-full bottom-0 left-0 pointer-events-none scale-[1.15] drop-shadow-xl"
        )
          img(src="~/assets/img/burrow-bg.png", draggable="false")
        
        // 擊中特效
        div(
          v-if="momiji.showHitSpark"
          class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
        )
          div(class="w-[120%] h-[120%] bg-white rounded-full animate-ping opacity-80 mix-blend-screen scale-150")
          div(class="absolute text-[60px] drop-shadow-[0_0_10px_rgba(255,255,255,1)] origin-center animate-[bounce_0.2s]") 💥

        // 坑洞前景 (遮罩用)
        div(
          class="z-20 absolute w-full bottom-0 left-0 pointer-events-none scale-[1.15]"
        )
          img(src="~/assets/img/burrow.png", draggable="false")
        
        // 分數提示 (非打擊時顯示在角色頭上，為了讓玩家知道該打誰。稍微美化)
        p(
          class="absolute z-20 top-[40%] text-center left-0 right-0 font-black text-[22px] pointer-events-none transition-opacity duration-300",
          class="opacity-0"
          :class="{'animate-[whack_1s]': momiji.whack, 'text-green-400': useFind(roleList, { name: momiji.role })?.score > 0, 'text-red-500': useFind(roleList, { name: momiji.role })?.score < 0}"
        )
          span(
            class="relative z-10 [text-shadow:2px_2px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]"
          ) {{ useGet(useFind(roleList, { name: momiji.role }), 'score') }}

        // 角色
        div.momiji(
          @mousedown="whack(index, $event)"
          class="z-10 absolute bottom-[18%] left-[10%] w-[80%] overflow-hidden max-h-0 cursor-pointer origin-bottom"
        )
          // 角色圖
          div(
            v-if="momiji.role == 'momiji'"
            class="relative w-full h-full flex items-end justify-center pb-2"
          )
            img(src="~/assets/img/momiji.png", draggable="false", v-if="!momiji.whack", class="w-[95%] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform")
            img(src="~/assets/img/momiji-whack.png", draggable="false", v-else, class="w-[95%] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] filter brightness-75 scale-95")
            
          div(
            v-else-if="momiji.role == 'neru'"
            class="relative w-full h-full flex items-end justify-center pb-2"
          )
            img(src="~/assets/img/neru.png", draggable="false", v-if="!momiji.whack", class="w-[95%] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform")
            img(src="~/assets/img/neru-whack.png", draggable="false", v-else, class="w-[95%] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] filter brightness-75 scale-95")
            
          div(
            v-else-if="momiji.role == 'staff'"
            class="relative w-full h-full flex items-end justify-center pb-2"
          )
            img(src="~/assets/img/staff.jpg", draggable="false", v-if="!momiji.whack", class="w-[85%] rounded-[30%] border-[6px] border-red-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transition-transform")
            img(src="~/assets/img/staff.jpg", draggable="false", v-else, class="w-[85%] rounded-[30%] border-[6px] border-red-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] grayscale sepia-[.5] hue-rotate-[-50deg] saturate-[200%] scale-95 brightness-75")

    // 開始按鈕覆蓋層
    div(
      v-if="!startOn"
      class="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-sm"
    )
      button(
        class="group relative px-10 py-6 font-black text-3xl sm:text-4xl text-white uppercase tracking-widest bg-rose-600 rounded-2xl border-b-[8px] border-rose-800 shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:border-b-0 active:translate-y-[8px] transition-all hover:bg-rose-500 hover:shadow-[0_15px_30px_rgba(225,29,72,0.6)] cursor-pointer"
        @click="setWhackTime"
      ) 
        span(class="relative z-10 [text-shadow:2px_2px_0_#9f1239]") START GAME
        div(class="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity")
</template>

<script setup>
import { gsap } from 'gsap';
const score = ref(0);

const momijiList = ref([]);

const roleList = [
  {
    name: 'momiji',
    score: 100,
  },
  {
    name: 'neru',
    score: 209,
  },
  {
    name: 'staff',
    score: -209,
  },
]

for (let i = 0; i < 9; i += 1) {
  momijiList.value.push({
    whack: false,
    isAnimate: false,
    role: 'momiji',
    showHitSpark: false
  });
}

const countdown = ref(10.0);
const startOn = ref(false);
const isShaking = ref(false);

const floatingMessages = ref([]);
let msgId = 0;

const showFloatingScore = (score, x, y) => {
  const id = msgId++;
  const offsetX = useRandom(-30, 30);
  floatingMessages.value.push({ id, score, x: x + offsetX - 30, y: y - 50 });

  nextTick(() => {
    const el = document.getElementById(`float-${id}`);
    if (el) {
      gsap.to(el, {
        y: y - 180, // Float up more prominently
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
        onComplete: () => {
          floatingMessages.value = floatingMessages.value.filter(m => m.id !== id);
        }
      });
    }
  });
};

const setWhackTime = () => {
  if (!startOn.value) {
    startOn.value = true;
    gsap.killTweensOf('.momiji');
    score.value = 0;
    countdown.value = 10.0
    const timeArray = [];
    useForEach(momijiList.value, (value, index) => {
      const setWT = setInterval(() => {
        if (!value.isAnimate) {
          value.isAnimate = true;
          if (momijiList.value[index].whack) {
            momijiList.value[index].whack = false;
          }
          if (useRandom(1, 5) > 4) {
            const roleFilter = useFilter(roleList, (role) => (role.name != 'momiji'));
            value.role = useGet(roleFilter[useRandom(0, (roleFilter.length - 1))], 'name')
            gsap.to(document.querySelectorAll('.momiji')[index], useRandom(0.4, 0.7), {
              ease: 'back.out(1.5)',
              'max-height': '100%',
              onComplete: () => {
                setTimeout(() => {
                  if (value.isAnimate) {
                    gsap.to(document.querySelectorAll('.momiji')[index], 0.3, {
                      ease: 'power2.in',
                      'max-height': '0px',
                      onComplete: () => {
                        value.isAnimate = false;
                        value.role = 'momiji'
                      }
                    })
                  }
                }, useRandom(0.4, 1.2) * 1000)
              }
            })
          } else {
            value.role = 'momiji'
            gsap.to(document.querySelectorAll('.momiji')[index], useRandom(0.4, 0.7), {
              ease: 'back.out(1.5)',
              'max-height': '100%',
              onComplete: () => {
                setTimeout(() => {
                  if (value.isAnimate) {
                    gsap.to(document.querySelectorAll('.momiji')[index], 0.3, {
                      ease: 'power2.in',
                      'max-height': '0px',
                      onComplete: () => {
                        value.isAnimate = false;
                      }
                    })
                  }
                }, useRandom(0.4, 1.2) * 1000)
              }
            })
          }
        }
      }, 100);
      timeArray.push(setWT);
    })
    const countDownSet = setInterval(() => {
      countdown.value = (countdown.value - 0.1).toFixed(1);
    }, 100)
    setTimeout(() => {
      useForEach(timeArray, (value) => {
        clearInterval(value);
      })
      gsap.killTweensOf('.momiji');
      useForEach(momijiList.value, (value, index) => {
        gsap.to(document.querySelectorAll('.momiji')[index], 0.2, {
          ease: 'power3.out',
          'max-height': '0px',
          onComplete: () => {
            value.isAnimate = false;
          }
        })
      })
      clearInterval(countDownSet);
      startOn.value = false;
    }, 10000)
  }
}

const whack = (index, event) => {
  if (!momijiList.value[index].whack && startOn.value) {
    momijiList.value[index].whack = true;
    const findRole = useFind(roleList, { name: momijiList.value[index].role })
    score.value += findRole.score;

    // Screen Shake Effect
    isShaking.value = true;
    setTimeout(() => { isShaking.value = false; }, 150);

    // Hit Spark Effect
    momijiList.value[index].showHitSpark = true;
    setTimeout(() => { momijiList.value[index].showHitSpark = false; }, 150);

    // Floating Score Effect
    if (event) {
      // Get the current mole target to center the text reasonably
      const targetRect = document.querySelectorAll('.momiji')[index].getBoundingClientRect();
      // event.clientX/Y from mouse, minus container absolute position
      // Using global positioning for the fixed message box relative to `grid relative` container
      // wait, actually x/y is relative to the `relative` parent container `.grid`?
      // No, `getBoundingClientRect` gives screen pixels, but floating text is inside `.grid.relative`?
      // Wait, let's look at floating text element:
      // It's `absolute` inside the `div.grid.relative`. So x, y should be relative to `.grid`.
      // The easiest layout is let's calculate relative to grid container.
      const gridContainer = document.querySelectorAll('.grid')[0];
      const gridRect = gridContainer.getBoundingClientRect();
      const x = event.clientX - gridRect.left;
      const y = event.clientY - gridRect.top;

      showFloatingScore(findRole.score, x, y);
    }

    gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);

    // Impact squash squash animation
    const imgWrapper = document.querySelectorAll('.momiji')[index].firstElementChild;
    gsap.to(imgWrapper, 0.05, {
      scaleY: 0.7,
      scaleX: 1.1,
      y: 10,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });

    setTimeout(() => {
      const imgTarget = document.querySelectorAll('.momiji')[index].querySelector('img');
      if (imgTarget) {
        gsap.to(imgTarget, 0.1, {
          x: 5,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })
      }
      gsap.to(document.querySelectorAll('.momiji')[index], 0.3, {
        ease: 'power2.in',
        'max-height': '0px',
        delay: 0.15,
        onComplete: () => {
          gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);
          if (imgTarget) gsap.killTweensOf(imgTarget);
          if (imgTarget) gsap.set(imgTarget, { x: 0 });
          gsap.set(imgWrapper, { scaleY: 1, scaleX: 1, y: 0 });
          momijiList.value[index].isAnimate = false;
        }
      })
    }, 50)
  }
}

useHead({
  title: 'Whack A Momiji'
})
</script>

<style>
/* 自訂槌子滑鼠游標 */
.custom-cursor {
  /* Cursor with a hammer emoji pointing up-left */
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><text y="40" font-size="40" style="filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.5))">🔨</text></svg>') 5 15, auto;
}
.custom-cursor:active {
  /* Hammer rotates down */
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g transform="rotate(-40 24 24)"><text y="40" font-size="40" style="filter: drop-shadow(2px 4px 0 rgba(0,0,0,0.5))">🔨</text></g></svg>') 5 25, auto;
}

/* 螢幕震動特效 */
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-2px, -3px) rotate(-1deg); }
  20% { transform: translate(-4px, 0px) rotate(1deg); }
  30% { transform: translate(4px, 3px) rotate(0deg); }
  40% { transform: translate(2px, -2px) rotate(1deg); }
  50% { transform: translate(-2px, 3px) rotate(-1deg); }
  60% { transform: translate(-4px, 2px) rotate(0deg); }
  70% { transform: translate(4px, 2px) rotate(-1deg); }
  80% { transform: translate(-2px, -2px) rotate(1deg); }
  90% { transform: translate(2px, 3px) rotate(0deg); }
  100% { transform: translate(1px, -3px) rotate(-1deg); }
}
.animate-shake {
  animation: shake 0.15s cubic-bezier(.36,.07,.19,.97) both;
}

/* 命中放大淡出 */
@keyframes whack {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(2); opacity: 0; }
}
</style>