const currentDay = new Date()
let currentYear = currentDay.getFullYear()
let currentMonth =currentDay.getMonth()
let activeCategory = 'gym'
let editMode = false
let calendarData = {}
let categoryColors = {
    'gym': 'green',
    'coding' : 'blue',
    'dj': 'purple'
}



const existingCalendarData = localStorage.getItem('calendarData')
if(existingCalendarData){
    calendarData = JSON.parse(existingCalendarData)
}

const defaults = { gym: 'green', coding: 'blue', dj: 'purple' }

const existingCategoryColors = localStorage.getItem('categoryColors')
if(existingCategoryColors){
    categoryColors = JSON.parse(existingCategoryColors)
}
categoryColors = { ...defaults, ...categoryColors }

Object.keys(categoryColors).forEach(category => {
    if(category !== 'gym' && category !== 'coding' && category !== 'dj'){
        if(!document.querySelector(`#${category}-card`)){
            createHabitCard(category)
        }
    }
})

document.querySelector('#gym-card').addEventListener('click', () =>{
  activeCategory= 'gym'
  console.log(activeCategory)
})

document.querySelector('#coding-card').addEventListener('click', () =>{
  activeCategory = 'coding'
  console.log(activeCategory)
})

document.querySelector('#dj-card').addEventListener('click', ()=>{
  activeCategory = 'dj'
  console.log(activeCategory)
})

document.querySelector('#gym-card .delete-btn').addEventListener('click', () => deleteCategory('gym'))
document.querySelector('#coding-card .delete-btn').addEventListener('click', () => deleteCategory('coding'))
document.querySelector('#dj-card .delete-btn').addEventListener('click', () => deleteCategory('dj'))

function deleteCategory(categoryName){
    let card = document.querySelector(`#${categoryName}-card`)
    card.remove()
    delete categoryColors[categoryName]

    let categoryDots = document.querySelectorAll(`[data-category="${categoryName}"]`)
    categoryDots.forEach( e =>{
        e.remove()
    })

    
   Object.keys(calendarData).forEach( e =>{
    calendarData[e] = calendarData[e].filter( c => c !== `${categoryName}`)
   })

    localStorage.setItem('calendarData', JSON.stringify(calendarData))
    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
}

function createHabitCard(habitName) {

    let habitNameCard = document.createElement('section')
    habitNameCard.classList.add('habit-card')
    habitNameCard.classList.add(`${habitName}-card`)
    habitNameCard.id = `${habitName}-card`
    document.querySelector('.habit-cards').appendChild(habitNameCard)

    let newDeleteBtn = document.createElement('button')
   newDeleteBtn.innerHTML = 'Delete'
   newDeleteBtn.classList.add('delete-btn') 
   newDeleteBtn.addEventListener('click', () =>     deleteCategory(habitName))
   habitNameCard.appendChild(newDeleteBtn)

    let habitNameLabel = document.createElement('p')
    habitNameLabel.innerHTML = habitName
    habitNameLabel.classList.add(`${habitName}-label`)
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


document.querySelector('#next-button').addEventListener('click', ()=>{

    currentMonth++ 
    if(currentMonth > 11){
        currentMonth = 0
        currentYear ++
    } 
    document.querySelector('#calendar-grid').innerHTML = ''
    renderCalendar()
})

document.querySelector('#new-habit-submit').addEventListener('click', ()=>{
    let newHabit = document.querySelector('#new-habit-input').value.trim().replace(/\s+/g, '-').toLowerCase()
    let newDotColor = document.querySelector('#new-habit-color').value
    categoryColors[newHabit] = newDotColor

    localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
    createHabitCard(newHabit)
    
})

document.querySelector('#prev-button').addEventListener('click', ()=>{

    currentMonth--
    if(currentMonth < 0){
        currentMonth = 11
        currentYear --
    } 
    document.querySelector('#calendar-grid').innerHTML = ''
    renderCalendar()
})


function renderCalendar(){
    const monthstart = new Date(currentYear ,currentMonth, 1).getDay()
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()

    document.querySelector('#month-display').innerHTML = `${new Date(currentYear, currentMonth, 1).toLocaleString('default', {month: 'long'})} ${currentYear}`
    
    
    for(let i=0; i<monthstart;i++){
        let emptyBox = document.createElement('div')
        emptyBox.classList.add('calendar-square')
        document.querySelector('#calendar-grid').appendChild(emptyBox)
    }

    for(let i=0;i<totalDays;i++){
        let calendarDay = document.createElement('div')
        calendarDay.innerHTML = i + 1
        calendarDay.dataset.day = `${currentYear}-${currentMonth}-${i + 1}`
        calendarDay.classList.add('calendar-square')
        document.querySelector('#calendar-grid').appendChild(calendarDay)

        if(calendarData[calendarDay.dataset.day]){
            calendarData[calendarDay.dataset.day].forEach( e =>{
                let oldDot = document.createElement('div')
                oldDot.classList.add('dot')
                oldDot.dataset.category = e                

        oldDot.style.background = categoryColors[e] 
        calendarDay.appendChild(oldDot)
            })
            
        }

        calendarDay.addEventListener('click', ()=>{
            console.log(categoryColors)
            console.log(activeCategory)
        let newDot = document.createElement('div')
        newDot.classList.add('dot')

        newDot.style.background = categoryColors[activeCategory]
        console.log(newDot.style.background)
        newDot.dataset.category = activeCategory

        let exsitingDot = calendarDay.querySelector(`[data-category="${activeCategory}"]`)
        if(exsitingDot){
            exsitingDot.remove()
            calendarData[calendarDay.dataset.day] = calendarData[calendarDay.dataset.day].filter( c => c !== activeCategory)
        }else {
            calendarDay.appendChild(newDot)
            if(!calendarData[calendarDay.dataset.day]){
                calendarData[calendarDay.dataset.day] = []
            }calendarData[calendarDay.dataset.day].push(activeCategory)
        }

        localStorage.setItem('calendarData', JSON.stringify(calendarData))
        localStorage.setItem('categoryColors', JSON.stringify(categoryColors))
        let categoryTotal = document.querySelectorAll(`[data-category="${activeCategory}"]`).length
        document.querySelector(`#${activeCategory}-card`).querySelector('.card-number').innerHTML = categoryTotal

        
    })
    }

 
}

renderCalendar()
let gymTotal = document.querySelectorAll(`[data-category="gym"]`).length
document.querySelector(`#gym-card`).querySelector('.card-number').innerHTML = gymTotal

let codingTotal = document.querySelectorAll(`[data-category="coding"]`).length
document.querySelector(`#coding-card`).querySelector('.card-number').innerHTML = codingTotal

let djTotal = document.querySelectorAll(`[data-category="dj"]`).length
document.querySelector(`#dj-card`).querySelector('.card-number').innerHTML = djTotal



