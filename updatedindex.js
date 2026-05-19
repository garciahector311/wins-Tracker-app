const currentDay = new Date()
let currentYear = currentDay.getFullYear()
let currentMonth = currentDay.getMonth()
let activeCategory = null
let editMode = false
let calendarData = {}

// Only use defaults if there's no saved data yet (first ever load)
const defaults = { gym: 'green', coding: 'blue', dj: 'purple' }
const defaultLabels = { gym: 'gym', coding: 'coding', dj: 'dj' }

const existingCalendarData = localStorage.getItem('calendarData')
if (existingCalendarData) {
    calendarData = JSON.parse(existingCalendarData)
}

// If categoryColors has never been saved, seed with defaults — otherwise use exactly what was saved
const existingCategoryColors = localStorage.getItem('categoryColors')
let categoryColors = existingCategoryColors ? JSON.parse(existingCategoryColors) : { ...defaults }

const existingCategoryLabels = localStorage.getItem('categoryLabels')
let categoryLabels = existingCategoryLabels ? JSON.parse(existingCategoryLabels) : { ...defaultLabels }

// Remove the hardcoded HTML cards — JS will rebuild all cards from saved state
document.querySelectorAll('.habit-card').forEach(card => card.remove())

// Build all cards from saved categoryColors (deleted ones won't be here)
Object.keys(categoryColors).forEach(category => {
    createHabitCard(category, categoryLabels[category] || category)
})

// Set the first available category as active
if (Object.keys(categoryColors).length > 0) {
    activeCategory = Object.keys(categoryColors)[0]
}

function createHabitCard(habitName, displayName) {
    const label = displayName || habitName

    let habitNameCard = document.createElement('section')
    habitNameCard.classList.add('habit-card')
    habitNameCard.id = `${habitName}-card`
    document.querySelector('.habit-cards').appendChild(habitNameCard)

    let newDeleteBtn = document.createElement('button')
    newDeleteBtn.innerHTML = 'Delete'
    newDeleteBtn.classList.add('delete-btn')
    newDeleteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        deleteCategory(habitName)
    })
    habitNameCard.appendChild(newDeleteBtn)

    let habitNameLabel = document.createElement('p')
    habitNameLabel.innerHTML = label
    habitNameLabel.classList.add('card-label')
    habitNameCard.appendChild(habitNameLabel)

    let habitNameCounter = document.createElement('p')
    habitNameCounter.innerHTML = 0
    habitNameCounter.classList.add('card-number')
    habitNameCard.appendChild(habitNameCounter)

    habitNameCard.addEventListener('click', () => {
        activeCategory = habitName
    })
}

function deleteCategory(categoryName) {
    const card = document.querySelector(`#${categoryName}-card`)
    if (card) card.remove()

    delete categoryColors[categoryName]
    delete categoryLabels[categoryName]

    document.querySelectorAll(`[data-category="${categoryName}"]`).forEach(dot => dot.remove())

    Object.keys(calendarData).forEach(day => {
        calendarData[day] = calendarData[day].filter(c => c !== categoryName)
    })

    // If the deleted category was active, switch to the first remaining one
    if (activeCategory === categoryName) {
        activeCategory = Object.keys(categoryColors)[0] || null
    }

    localStorage.setItem('calendarData', JSON.stringify(calendarData))
    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
    localStorage.setItem('categoryLabels', JSON.stringify(categoryLabels))
}

document.querySelector('#edit-btn').addEventListener('click', () => {
    editMode = !editMode
    document.querySelector('.habit-cards').classList.toggle('edit-mode')
})

document.querySelector('#next-button').addEventListener('click', () => {
    currentMonth++
    if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
    }
    document.querySelector('#calendar-grid').innerHTML = ''
    renderCalendar()
})

document.querySelector('#prev-button').addEventListener('click', () => {
    currentMonth--
    if (currentMonth < 0) {
        currentMonth = 11
        currentYear--
    }
    document.querySelector('#calendar-grid').innerHTML = ''
    renderCalendar()
})

document.querySelector('#new-habit-submit').addEventListener('click', () => {
    const rawInput = document.querySelector('#new-habit-input').value.trim()
    if (!rawInput) return

    const newHabit = rawInput.replace(/\s+/g, '-').toLowerCase()
    const displayName = rawInput
    const newDotColor = document.querySelector('#new-habit-color').value

    categoryColors[newHabit] = newDotColor
    categoryLabels[newHabit] = displayName

    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
    localStorage.setItem('categoryLabels', JSON.stringify(categoryLabels))

    createHabitCard(newHabit, displayName)
    document.querySelector('#new-habit-input').value = ''
    activeCategory = newHabit
})

function renderCalendar() {
    const monthstart = new Date(currentYear, currentMonth, 1).getDay()
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()

    document.querySelector('#month-display').innerHTML =
        `${new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' })} ${currentYear}`

    for (let i = 0; i < monthstart; i++) {
        let emptyBox = document.createElement('div')
        emptyBox.classList.add('calendar-square')
        document.querySelector('#calendar-grid').appendChild(emptyBox)
    }

    for (let i = 0; i < totalDays; i++) {
        let calendarDay = document.createElement('div')
        calendarDay.innerHTML = i + 1
        calendarDay.dataset.day = `${currentYear}-${currentMonth}-${i + 1}`
        calendarDay.classList.add('calendar-square')
        document.querySelector('#calendar-grid').appendChild(calendarDay)

        if (calendarData[calendarDay.dataset.day]) {
            calendarData[calendarDay.dataset.day].forEach(e => {
                let oldDot = document.createElement('div')
                oldDot.classList.add('dot')
                oldDot.dataset.category = e
                oldDot.style.background = categoryColors[e]
                calendarDay.appendChild(oldDot)
            })
        }

        calendarDay.addEventListener('click', () => {
            if (!activeCategory) return

            let newDot = document.createElement('div')
            newDot.classList.add('dot')
            newDot.style.background = categoryColors[activeCategory]
            newDot.dataset.category = activeCategory

            let existingDot = calendarDay.querySelector(`[data-category="${activeCategory}"]`)
            if (existingDot) {
                existingDot.remove()
                calendarData[calendarDay.dataset.day] = calendarData[calendarDay.dataset.day].filter(c => c !== activeCategory)
            } else {
                calendarDay.appendChild(newDot)
                if (!calendarData[calendarDay.dataset.day]) {
                    calendarData[calendarDay.dataset.day] = []
                }
                calendarData[calendarDay.dataset.day].push(activeCategory)
            }

            localStorage.setItem('calendarData', JSON.stringify(calendarData))
            localStorage.setItem('categoryColors', JSON.stringify(categoryColors))

            const categoryTotal = document.querySelectorAll(`[data-category="${activeCategory}"]`).length
            const activeCard = document.querySelector(`#${activeCategory}-card`)
            if (activeCard) activeCard.querySelector('.card-number').innerHTML = categoryTotal
        })
    }

    // Update all card counts after rendering
    Object.keys(categoryColors).forEach(category => {
        const card = document.querySelector(`#${category}-card`)
        if (card) {
            const total = document.querySelectorAll(`[data-category="${category}"]`).length
            card.querySelector('.card-number').innerHTML = total
        }
    })
}

renderCalendar()