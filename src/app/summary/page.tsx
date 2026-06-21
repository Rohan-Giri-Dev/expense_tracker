'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Transaction } from '../../../generated/prisma/browser';

function Summary() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState<"INCOME" | "EXPENSE">()
    const [error, setError] = useState("")
    const [income, setIncome] = useState(0)
    const [expense, setExpense] = useState(0)
    

    const fetchTransactions = async () => {
        const res = await fetch("/api/summary")
        const data = await res.json()

        if(!res.ok){
            return setError(data.error || "Failed to fetch the transactions")
        }
        setTransactions(data)
    } 

    //useMemo is a React Hook used to remember the result of a calculation between re-renders.
    const groupData = useMemo(() => {
        
    }, [transactions])

    
    useEffect(() => {
        fetchTransactions()
    }, [])

  return (
    <div>Summary</div>
  )
}

export default Summary