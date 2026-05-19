const currentDay = new Date()
let currentYear = currentDay.getFullYear()
let currentMonth = currentDay.getMonth()
let activeCategory = 'gym'
let editMode = false
let calendarData = {}
let categoryColors = {
    'gym': 'green',
    'coding': 'blue',
    'dj': 'purple'
}
// NEW: store human-readable display names separately
let categoryLabels = {
    'gym': 'gym',
    'coding': 'coding',
    'dj': 'dj'
}

const existingCalendarData = localStorage.getItem('calendarData')
if (existingCalendarData) {
    calendarData = JSON.parse(existingCalendarData)
}

const defaults = { gym: 'green', coding: 'blue', dj: 'purple' }
const defaultLabels = { gym: 'gym', coding: 'coding', dj: 'dj' }

const existingCategoryColors = localStorage.getItem('categoryColors')
if (existingCategoryColors) {
    categoryColors = JSON.parse(existingCategoryColors)
}
categoryColors = { ...defaults, ...categoryColors }

// FIX: load saved labels so dynamic categories show their real names on refresh
const existingCategoryLabels = localStorage.getItem('categoryLabels')
if (existingCategoryLabels) {
    categoryLabels = JSON.parse(existingCategoryLabels)
}
categoryLabels = { ...defaultLabels, ...categoryLabels }

// Recreate dynamic habit cards on page load
Object.keys(categoryColors).forEach(category => {
    if (category !== 'gym' && category !== 'coding' && category !== 'dj') {
        if (!document.querySelector(`#${category}-card`)) {
            createHabitCard(category, categoryLabels[category] || category)
        }
    }
})

document.querySelector('#gym-card').addEventListener('click', () => {
    activeCategory = 'gym'
})

document.querySelector('#coding-card').addEventListener('click', () => {
    activeCategory = 'coding'
})

document.querySelector('#dj-card').addEventListener('click', () => {
    activeCategory = 'dj'
})

document.querySelector('#gym-card .delete-btn').addEventListener('click', () => deleteCategory('gym'))
document.querySelector('#coding-card .delete-btn').addEventListener('click', () => deleteCategory('coding'))
document.querySelector('#dj-card .delete-btn').addEventListener('click', () => deleteCategory('dj'))

function deleteCategory(categoryName) {
    let card = document.querySelector(`#${categoryName}-card`)
    card.remove()
    delete categoryColors[categoryName]
    delete categoryLabels[categoryName]  // FIX: also clean up labels

    let categoryDots = document.querySelectorAll(`[data-category="${categoryName}"]`)
    categoryDots.forEach(e => {
        e.remove()
    })

    Object.keys(calendarData).forEach(e => {
        calendarData[e] = calendarData[e].filter(c => c !== `${categoryName}`)
    })

    localStorage.setItem('calendarData', JSON.stringify(calendarData))
    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
    localStorage.setItem('categoryLabels', JSON.stringify(categoryLabels))  // FIX: save labels
}

// FIX: accept a displayName param separate from the slug
function createHabitCard(habitName, displayName) {
    // Fall back to habitName if no display name passed
    const label = displayName || habitName

    let habitNameCard = document.createElement('section')
    habitNameCard.classList.add('habit-card')
    habitNameCard.classList.add(`${habitName}-card`)
    habitNameCard.id = `${habitName}-card`
    document.querySelector('.habit-cards').appendChild(habitNameCard)

    let newDeleteBtn = document.createElement('button')
    newDeleteBtn.innerHTML = 'Delete'
    newDeleteBtn.classList.add('delete-btn')
    newDeleteBtn.addEventListener('click', () => deleteCategory(habitName))
    habitNameCard.appendChild(newDeleteBtn)

    let habitNameLabel = document.createElement('p')
    habitNameLabel.innerHTML = label          // FIX: show human-readable name
    habitNameLabel.classList.add('card-label') // FIX: was missing this class — caused font mismatch
    habitNameCard.appendChild(habitNameLabel)

    let habitNameCounter = document.createElement('p')
    habitNameCounter.innerHTML = 0
    habitNameCounter.classList.add('card-number')
    habitNameCounter.classList.add(`${habitName}-number`)
    habitNameCard.appendChild(habitNameCounter)

    habitNameCard.addEventListener('click', () => {
        activeCategory = `${habitName}`
    })
}

document.querySelector('#edit-btn').addEventListener('click', () => {
    editMode = editMode ? false : true
    document.querySelector(`.habit-cards`).classList.toggle('edit-mode')
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

document.querySelector('#new-habit-submit').addEventListener('click', () => {
    const rawInput = document.querySelector('#new-habit-input').value.trim()
    if (!rawInput) return

    // slug used as the key/ID, original text shown as the label
    const newHabit = rawInput.replace(/\s+/g, '-').toLowerCase()  // key stays slugified
    const displayName = rawInput                                   // FIX: display original text

    const newDotColor = document.querySelector('#new-habit-color').value
    categoryColors[newHabit] = newDotColor
    categoryLabels[newHabit] = displayName  // FIX: save display name

    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
    localStorage.setItem('categoryLabels', JSON.stringify(categoryLabels))  // FIX: persist it

    createHabitCard(newHabit, displayName)
    document.querySelector('#new-habit-input').value = ''  // clear input after submit
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


function renderCalendar() {
    const monthstart = new Date(currentYear, currentMonth, 1).getDay()
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()

    document.querySelector('#month-display').innerHTML = `${new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' })} ${currentYear}`

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

            let categoryTotal = document.querySelectorAll(`[data-category="${activeCategory}"]`).length
            document.querySelector(`#${activeCategory}-card`).querySelector('.card-number').innerHTML = categoryTotal
        })
    }
}

renderCalendar()

// FIX: update counts for ALL categories, not just the 3 hardcoded ones
Object.keys(categoryColors).forEach(category => {
    const card = document.querySelector(`#${category}-card`)
    if (card) {
        const total = document.querySelectorAll(`[data-category="${category}"]`).length
        card.querySelector('.card-number').innerHTML = total
    }
})