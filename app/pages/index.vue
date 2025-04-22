<template lang="pug">
div(
  class="bg-green-700 max-w-[500px] mx-auto flex flex-col h-full justify-between p-[20px]"
)
  div(
    class="text-[20px] text-center"
  )
    h1(
      class="text-[30px] uppercase font-bold"
    ) Whack A Momiji
    h2(
      class="text-[24px] font-bold"
    ) {{`score: ${score}`}}
    p(
      v-if="!startOn"
      class="text-[18px] font-bold mt-[40px] py-[10px] cursor-pointer border-[1px] bg-slate-600 text-white"
      class="hover:bg-slate-400 hover:text-slate-700"
      @click="setWhackTime"
    ) START
    p(
      v-else
      class="text-[18px] font-bold mt-[40px] py-[10px] border-[1px] bg-slate-600 text-white"
    ) {{`時間倒數：${countdown}s`}}
  div(
    class="flex-none grid-cols-3 grid gap-[10px] "
  )
    div(
      v-for="(momiji, index) in momijiList",
      class="aspect-square  relative group",
      :class="{ 'z-30': index > 2, 'z-40': index > 5}"
    )
      div(
        class="z-0 absolute rounded-full w-full bottom-0 left-0 pointer-events-none"
      )
        img(src="~/assets/img/burrow-bg.png", draggable="false")
      div(
        class="z-20 absolute rounded-full w-full bottom-0 left-0 pointer-events-none"
      )
        img(src="~/assets/img/burrow.png", draggable="false")
      div.momiji(
        @click="whack(index)"
        class="z-10 absolute bottom-[14px] left-0 w-full overflow-hidden max-h-0 cursor-pointer px-[10px]"
      )
        div(
          v-if="!momiji.chestnut"
        )
          img(src="~/assets/img/momiji.png", draggable="false", v-if="!momiji.whack")
          img(src="~/assets/img/momiji-whack.png", draggable="false", v-else)
        div(
          v-else
        )
          img(src="~/assets/img/neru.png", draggable="false", v-if="!momiji.whack")
          img(src="~/assets/img/neru-whack.png", draggable="false", v-else)
</template>

<script setup>
import { gsap } from 'gsap';
const score = ref(0);

const momijiList = ref([]);

for(let i = 0; i < 9; i+=1) {
  momijiList.value.push({
    whack: false,
    isAnimate: false,
    chestnut: false,
  });
}

const chestnutShow = ref(false);

const countdown = ref(10.0);
const startOn = ref(false);
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
            chestnutShow.value = true;
            value.chestnut = true;
            gsap.to(document.querySelectorAll('.momiji')[index], useRandom(1.5, 4), {
              ease: 'power3.in',
              'max-height': '100%',
              onComplete: () => {
                setTimeout(() => {
                  if (value.isAnimate) {
                    gsap.to(document.querySelectorAll('.momiji')[index], 0.5, {
                      ease: 'power3.out',
                      'max-height': '0px',
                      onComplete: () => {
                        value.isAnimate = false;
                        value.chestnut = false;
                      }
                    })
                  }
                }, useRandom(0, 0.5) * 800)
              }
            })
          } else {
            value.chestnut = false;
            gsap.to(document.querySelectorAll('.momiji')[index], useRandom(1, 5), {
              ease: 'power3.in',
              'max-height': '100%',
              onComplete: () => {
                setTimeout(() => {
                  if (value.isAnimate) {
                    gsap.to(document.querySelectorAll('.momiji')[index], 1, {
                      ease: 'power3.out',
                      'max-height': '0px',
                      onComplete: () => {
                        value.isAnimate = false;
                      }
                    })
                  }
                }, useRandom(0, 0.5) * 800)
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
        gsap.to(document.querySelectorAll('.momiji')[index], 0.1, {
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


const whack = (index) => {
  if (!momijiList.value[index].whack) {
    momijiList.value[index].whack = true;
    if (momijiList.value[index].chestnut) {
      score.value += 209;
    } else {
      score.value += 100;
    }
    gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);
    setTimeout(() => {
      gsap.to(document.querySelectorAll('.momiji img')[index], 0.1, {
        x: 5,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(document.querySelectorAll('.momiji')[index], 2, {
        ease: 'power3.out',
        'max-height': '0px',
        onComplete: () => {
          gsap.killTweensOf(document.querySelectorAll('.momiji')[index]);
          gsap.killTweensOf(document.querySelectorAll('.momiji img')[index]);
          momijiList.value[index].isAnimate = false;
        }
      })
    }, 100)
  }
}

useHead({
  title: 'Whack A Momiji'
})
</script>