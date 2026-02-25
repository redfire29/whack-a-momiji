<template lang="pug">
div(
  class="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 select-none custom-cursor font-sans text-slate-800"
  :class="{ 'animate-subtle-shake': isShaking }"
)
  // 現代化背景裝飾 (抽象形狀)
  div(class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300 mix-blend-multiply filter blur-[80px] opacity-40 animate-blob pointer-events-none")
  div(class="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-300 mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000 pointer-events-none")
  div(class="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-200 mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000 pointer-events-none")
  
  // 主遊戲毛玻璃容器 (Glassmorphism)
  div(
    class="relative w-[95%] sm:w-full max-w-[650px] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6 sm:p-8 z-10 flex flex-col justify-between"
  )
    // 頂部資訊列 (簡約清爽)
    div(
      class="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 sm:px-8 rounded-3xl mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/60"
    )
      // 分數
      div(class="flex flex-col items-start")
        span(class="text-slate-400 font-semibold text-sm tracking-wider uppercase mb-1") Score
        span(class="text-indigo-600 text-3xl sm:text-4xl font-black tabular-nums") {{ score }}
      
      // 標題
      div(class="text-center hidden sm:block")
        h1(
          class="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500 tracking-tight"
        ) Whack A Momiji
        
      // 時間
      div(class="flex flex-col items-end")
        span(class="text-slate-400 font-semibold text-sm tracking-wider uppercase mb-1") Time
        span(
          class="text-slate-700 text-3xl sm:text-4xl font-black tabular-nums transition-colors duration-300"
          :class="{ 'text-rose-500': countdown <= 3 && startOn }"
        ) {{ countdown }}
        
    // 手機版標題 (放在資訊列下方)
    div(class="text-center sm:hidden mb-6 mt-[-10px]")
      h1(class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500 tracking-tight") Whack A Momiji

    // 遊戲區域
    div(
      class="grid grid-cols-3 gap-3 sm:gap-5 relative mt-2"
    )
      // 動態飄浮數字容器 (Floating Text - UI modern化)
      div(
        v-for="msg in floatingMessages"
        :key="msg.id"
        :id="'float-' + msg.id"
        class="absolute z-50 font-black text-4xl sm:text-5xl pointer-events-none tracking-tight opacity-100 filter"
        :class="msg.score > 0 ? 'text-green-500 drop-shadow-[0_2px_4px_rgba(0,128,0,0.8)] [text-shadow:0px_0px_6px_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff,1px_1px_0_#fff,2px_2px_0_#065f46]' : 'text-red-600 drop-shadow-[0_2px_4px_rgba(255,0,0,0.8)] [text-shadow:0px_0px_6px_#fff,-1px_-1px_0_#fff,1px_-1px_0_#fff,-1px_1px_0_#fff,1px_1px_0_#fff,2px_2px_0_#991b1b]'"
        :style="{ left: msg.x + 'px', top: msg.y + 'px' }"
      ) {{ msg.score > 0 ? '+' : '' }}{{ msg.score }}

      div(
        v-for="(momiji, index) in momijiList",
        class="aspect-square relative group",
        :class="{ 'z-30': index > 2, 'z-40': index > 5}"
      )
        // 坑洞背景 (簡化陰影)
        div(
          class="z-0 absolute w-full bottom-[5%] left-0 pointer-events-none scale-[1.05] opacity-90 drop-shadow-sm"
        )
          img(src="~/assets/img/burrow-bg.png", draggable="false")
        
        // 擊中特效 (優化為柔和光暈，不再那麼刺眼)
        div(
          v-if="momiji.showHitSpark"
          class="absolute inset-x-0 bottom-[10%] h-[60%] z-50 flex items-center justify-center pointer-events-none"
        )
          div(class="absolute w-[80%] aspect-square bg-sky-200/60 rounded-full blur-xl scale-150 transition-all duration-200 ease-out")
          div(class="w-full text-center text-4xl transform -translate-y-4 filter drop-shadow-lg opacity-80 animate-[ping_0.3s_ease-out_forwards]") ✨

        // 坑洞前景 (遮罩用)
        div(
          class="z-20 absolute w-full bottom-[5%] left-0 pointer-events-none scale-[1.05] opacity-90 drop-shadow-sm"
        )
          img(src="~/assets/img/burrow.png", draggable="false")

        // 角色 (地鼠)
        div.momiji(
          @mousedown="whack(index, $event)"
          class="z-10 absolute bottom-[20%] left-[10%] w-[80%] overflow-hidden max-h-0 cursor-pointer origin-bottom"
        )
          // Momiji
          div(
            v-if="momiji.role == 'momiji'"
            class="relative w-full h-full flex items-end justify-center pb-1"
          )
            img(src="~/assets/img/momiji.png", draggable="false", v-if="!momiji.whack", class="w-[90%] drop-shadow-md transition-transform")
            img(src="~/assets/img/momiji-whack.png", draggable="false", v-else, class="w-[90%] drop-shadow-md filter brightness-90 scale-95")
            
          // Neru
          div(
            v-else-if="momiji.role == 'neru'"
            class="relative w-full h-full flex items-end justify-center pb-1"
          )
            img(src="~/assets/img/neru.png", draggable="false", v-if="!momiji.whack", class="w-[90%] drop-shadow-md transition-transform")
            img(src="~/assets/img/neru-whack.png", draggable="false", v-else, class="w-[90%] drop-shadow-md filter brightness-90 scale-95")
            
          // Staff
          div(
            v-else-if="momiji.role == 'staff'"
            class="relative w-full h-full flex items-end justify-center pb-1"
          )
            img(src="~/assets/img/staff.jpg", draggable="false", v-if="!momiji.whack", class="w-[80%] rounded-full border-4 border-white shadow-md transition-transform")
            img(src="~/assets/img/staff.jpg", draggable="false", v-else, class="w-[80%] rounded-full border-4 border-rose-400 shadow-md grayscale-[0.8] scale-95 brightness-90")

    // 開始按鈕與規則覆蓋層 (現代感)
    transition(name="fade")
      div(
        v-if="!startOn"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl rounded-[40px]"
      )
        // 遊戲結束時顯示結算分數
        div(
          v-if="hasPlayed"
          class="flex flex-col items-center mb-8"
        )
          h2(class="text-slate-500 font-bold text-xl tracking-widest uppercase mb-2") 本次得分
          div(class="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-400 drop-shadow-md mb-4") {{ score }}
          
        // （已依需求隱藏了首頁的公開計分規則）
        // 可以放置一個簡單的遊戲標題或是歡迎文字
        div(
          v-else
          class="mb-8 flex flex-col items-center"
        )
          div(class="text-6xl text-center mb-4 filter drop-shadow-md animate-bounce") 🔨
          h2(class="text-slate-700 font-bold text-2xl tracking-widest uppercase text-center") 準備好打地鼠了嗎？

        // 現代感層級的開始按鈕 (加入 disabled 防連點)
        button(
          :disabled="isCoolingDown"
          class="group relative px-12 py-5 font-bold text-xl sm:text-2xl text-white tracking-widest rounded-full shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all overflow-hidden"
          :class="isCoolingDown ? 'bg-slate-400 cursor-not-allowed shadow-none scale-95 opacity-80' : 'bg-indigo-600 active:scale-95 hover:bg-indigo-500 hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] cursor-pointer'"
          @click="setWhackTime"
        ) 
          span(class="relative z-10") {{ hasPlayed ? '再玩一次' : '開始遊戲' }}
          div(class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer")
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
const hasPlayed = ref(false);
const isCoolingDown = ref(false);
const isShaking = ref(false);

const floatingMessages = ref([]);
let msgId = 0;

const showFloatingScore = (score, x, y) => {
  const id = msgId++;
  // 固定在游標上方偏右一點產生，避免擋住地鼠本身，不加亂數免得分散
  floatingMessages.value.push({ id, score, x: x - 20, y: y - 50 });

  nextTick(() => {
    const el = document.getElementById(`float-${id}`);
    if (el) {
      gsap.to(el, {
        y: y - 250, // 上升幅度大大增加 (原本是 y - 100)
        opacity: 0,
        scale: 1.5, // 放大程度增加
        duration: 1.2, // 飄浮時間拉長
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
          // 若目前畫面上已經有超過一定數量的地鼠 (例如：最多同時出現 3 隻)，就放棄這次出現的機會，降低擁擠感
          const activeCount = useFilter(momijiList.value, m => m.isAnimate).length;

          // 加入機率判定：每次判定只有 30% 到 40% 的機率真的會探頭，且最多只允許 3 隻同時在場上
          if (useRandom(1, 10) <= 6 || activeCount >= 4) {
            // 這次不出現，提早結束 interval 內的動作
            value.isAnimate = false;
            return;
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
      }, 500); // 將原先的 100ms 檢查間隔拉長，不要太過緊湊
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

      // 結束遊戲時進入結算畫面，並開啟防誤觸冷卻機制
      startOn.value = false;
      hasPlayed.value = true;
      isCoolingDown.value = true;

      // 1.5 秒後才允許再次點擊「再玩一次」
      setTimeout(() => {
        isCoolingDown.value = false;
      }, 1500);

    }, 10000)
  }
}

const whack = (index, event) => {
  if (!momijiList.value[index].whack && startOn.value) {
    momijiList.value[index].whack = true;
    const findRole = useFind(roleList, { name: momijiList.value[index].role })
    score.value += findRole.score;

    // 依需求移除螢幕震動特效

    // 柔化光暈特效
    momijiList.value[index].showHitSpark = true;
    setTimeout(() => { momijiList.value[index].showHitSpark = false; }, 200);

    // 顯示飄浮分數
    if (event) {
      const gridContainer = document.querySelectorAll('.grid')[0];
      const gridRect = gridContainer.getBoundingClientRect();
      const x = event.clientX - gridRect.left;
      const y = event.clientY - gridRect.top;

      showFloatingScore(findRole.score, x, y);
    }

    gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);

    // 壓扁動畫維持簡潔
    const imgWrapper = document.querySelectorAll('.momiji')[index].firstElementChild;
    gsap.to(imgWrapper, 0.05, {
      scaleY: 0.8,
      scaleX: 1.05,
      y: 8,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1,
    });

    setTimeout(() => {
      const imgTarget = document.querySelectorAll('.momiji')[index].querySelector('img');
      if (imgTarget) {
        gsap.to(imgTarget, 0.1, {
          x: 3,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        })
      }
      gsap.to(document.querySelectorAll('.momiji')[index], 0.25, {
        ease: 'power2.in',
        'max-height': '0px',
        delay: 0.1,
        onComplete: () => {
          gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);
          if (imgTarget) gsap.killTweensOf(imgTarget);
          if (imgTarget) gsap.set(imgTarget, { x: 0 });
          gsap.set(imgWrapper, { scaleY: 1, scaleX: 1, y: 0 });
          momijiList.value[index].isAnimate = false;
        }
      })
    }, 40)
  }
}

useHead({
  title: 'Whack A Momiji'
})
</script>

<style>
/* 自訂槌子滑鼠游標 (保留) */
.custom-cursor {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><text y="40" font-size="40" style="filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.2))">🔨</text></svg>') 5 15, auto;
}
.custom-cursor:active {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g transform="rotate(-40 24 24)"><text y="40" font-size="40" style="filter: drop-shadow(1px 2px 0 rgba(0,0,0,0.2))">🔨</text></g></svg>') 5 25, auto;
}

/* 減弱後的螢幕微震動 */
@keyframes subtle-shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  25% { transform: translate(-1px, 0px) rotate(-0.5deg); }
  50% { transform: translate(0px, -1px) rotate(0.5deg); }
  75% { transform: translate(1px, 0px) rotate(0deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
}
.animate-subtle-shake {
  animation: subtle-shake 0.1s ease-in-out both;
}

/* 漸變按鈕閃爍效果 */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}

/* 裝飾背景 Blob 動畫 */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

/* Vue Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>