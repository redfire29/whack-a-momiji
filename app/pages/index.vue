<template lang="pug">
div(
  class="border-[1px] border-gray-700 max-w-[500px] mx-auto flex flex-col h-full justify-between p-[20px]"
)
  div(
    class="text-[20px] text-center"
  )
    h1(
      class="text-[30px]"
    ) Whack A Momiji
    h2(
      class="text-[24px] font-bold"
    ) {{`score: ${score}`}}
    p(
      class="text-[18px] font-bold mt-[40px] py-[10px] cursor-pointer border-[1px] bg-slate-600 text-white"
      class="hover:bg-slate-400 hover:text-slate-700"
      @click="setWhackTime"
    ) START
  div(
    class="flex-none grid-cols-3 grid gap-[10px] "
  )
    div(
      v-for="(momiji, index) in momijiList",
      class="aspect-square border-[1px] border-red-700 relative group",
      :class="{ 'z-30': index > 2}"
    )
      div(
        class="z-20 absolute rounded-full h-[50px] w-full bottom-0 left-0 bg-green-400"
      )
      div.momiji(
        @click="whack(index)"
        class="z-10 absolute bottom-0 left-0 w-full overflow-hidden h-0 cursor-pointer"
      )
        img(src="~/assets/img/demo.jpg", draggable="false")
</template>

<script setup>
import { gsap } from 'gsap';
const score = ref(0);

const momijiList = [
  {
    whack: false,
    isAnimate: false,
  },
  {
    whack: false,
    isAnimate: false,
  },
  {
    whack: false,
    isAnimate: false,
  },
  {
    whack: false,
    isAnimate: false,
  },
  {
    whack: false,
    isAnimate: false,
  },
  {
    whack: false,
    isAnimate: false,
  }
]

const setWhackTime = () => {
  score.value = 0;
  const timeArray = [];
  useForEach(momijiList, (value, index) => {
    const setWT = setInterval(() => {
      if (!value.isAnimate) {
        value.isAnimate = true;
        if (momijiList[index].whack) {
          momijiList[index].whack = false;
        }
        gsap.to(document.querySelectorAll('.momiji')[index], useRandom(3, 5), {
          ease: 'power3.in',
          height: '200px',
          onComplete: () => {
            gsap.to(document.querySelectorAll('.momiji')[index], 1, {
              ease: 'power3.out',
              height: '0px',
              onComplete: () => {
                value.isAnimate = false;
              }
            })
          }
        })
      }
    }, 500);
    timeArray.push(setWT);
  })
  setTimeout(() => {
    useForEach(timeArray, (value) => {
      clearInterval(value);
    })
  }, 10000)
}

const whack = (index) => {
  if (!momijiList[index].whack) {
    momijiList[index].whack = true;
    score.value += 100;
    gsap.to(document.querySelectorAll('.momiji')[index], 1, {
      ease: 'power3.out',
      height: '0px',
      onComplete: () => {
        momijiList[index].isAnimate = false;
      }
    })
  }
}
</script>