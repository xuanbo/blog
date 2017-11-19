const WORDS = ['富强', '民主', '文明', '和谐', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善']

document.addEventListener('click', function(e) {
    let index = parseInt(Math.random() * 12)
    showWord(index, {
        left: e.clientX,
        top: e.clientY
    })
})

function showWord(index, point) {
    let div = document.createElement('div')
    div.innerText = WORDS[index]
    div.className = 'word'
    div.style.left = point.left + 'px'
    div.style.top = point.top + 'px'
    document.body.appendChild(div)
    animate(div)
}

function animate(div) {
    let move = setInterval(function() {
        div.style.top = parseInt(div.style.top) - 10 + 'px'
        div.style.left = parseInt(div.style.left) + 10 + 'px'
    }, 100)
    setTimeout(function() {
        clearInterval(move)
        document.body.removeChild(div)
    }, 3000)
}
