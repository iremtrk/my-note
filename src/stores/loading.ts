import {defineStore} from 'pinia'
import {ref,computed} from 'vue'

export const useLoadingStore = defineStore('loading',()=>{
    const activeKeys = ref <Set<string>>(new Set())

    const isLoading=(key:string) => computed(()=>activeKeys.value.has(key))
    const isAnyLoading = computed(()=> activeKeys.value.size>0)

    const start = (key:string)=>{
        activeKeys.value=new Set(activeKeys.value).add(key)
    }

    const stop = (key: string)=>{
        const next=new Set(activeKeys.value)
        next.delete(key)
        activeKeys.value=next
    }

    const wrap =async <T> (key:string,fn:()=>Promise<T>):Promise<T> =>{
        start(key)
        try{
            return await fn()
        }finally{
            stop(key)
        }
    }

    return {isLoading,isAnyLoading,start,stop,wrap}
})