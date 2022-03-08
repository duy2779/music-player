const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const heading = $('header h2')
const cd = $('.cd')
const cdThumb = $('.cd__thumb')
const audio = $('audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const repeatBtn = $('.btn-repeat')
const randomBtn = $('.btn-random')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "たぶん",
            singer: "Yoasobi",
            path: "./assets/audio/Tabun.mp3",
            image: "./assets/img/Tabun.jpg"
        },
        {
            name: "夜に駆ける",
            singer: "Yoasobi",
            path: "./assets/audio/Yoru-ni-kakeru.mp3",
            image: "./assets/img/Yoru-ni-kakeru.jpg"
        },
        {
            name: "アンコール",
            singer: "Yoasobi",
            path: "./assets/audio/Ankoru.mp3",
            image: "./assets/img/Ankoru.jpg"
        },
        {
            name: "あの夢をなぞって",
            singer: "Yoasobi",
            path: "./assets/audio/Ano-yume-wo-nazotte.mp3",
            image: "./assets/img/Ano-yume-wo-nazotte.jpg"
        },
        {
            name: "群青",
            singer: "Yoasobi",
            path: "./assets/audio/Gunjou.mp3",
            image: "./assets/img/Gunjou.jpg"
        },
        {
            name: "ハルジオン",
            singer: "Yoasobi",
            path: "./assets/audio/Harujion.mp3",
            image: "./assets/img/Harujion.jpg"
        },
        {
            name: "怪物",
            singer: "Yoasobi",
            path: "./assets/audio/Kaibutsu.mp3",
            image: "./assets/img/Kaibutsu.jpg"
        },
        {
            name: "もしも命が描けたら",
            singer: "Yoasobi",
            path: "./assets/audio/Moshimo-inochiga-egaketara.mp3",
            image: "./assets/img/Moshimo-inochiga-egaketara.jpg"
        },
        {
            name: "三原色",
            singer: "Yoasobi",
            path: "./assets/audio/Sangenshoku.mp3",
            image: "./assets/img/Sangenshoku.jpg"
        },
        {
            name: "ツバメ",
            singer: "Yoasobi",
            path: "./assets/audio/Tsubame.mp3",
            image: "./assets/img/Tsubame.jpg"
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                    <div 
                    class="song ${this.currentIndex === index ? 'active' : ''}" 
                    data-index="${index}"
                    >
                        <div
                        class="thumb"
                        style="
                            background-image: url('${song.image}');
                        "
                        ></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
            `
        })

        playlist.innerHTML = htmls.join("")
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        //cd rotate
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // handle cd zoom in/out
        const cdWidth = cd.offsetWidth
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        //handle when click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        //when audio playing
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //when audio pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //when audio time change
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = progressPercent
            }
        }

        //when skip song time
        progress.oninput = function () {
            const seekTime = audio.duration / 100 * this.value
            audio.currentTime = seekTime
        }

        //next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //random click
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        //repeat click
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            this.classList.toggle('active', _this.isRepeat)
        }

        //when audio end
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        //song click
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if (e.target.closest('.option')) {
                    console.log("abc")
                }
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(function () {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function () {
        this.loadConfig()
        this.defineProperties();
        this.handleEvents();
        this.loadCurrentSong();

        this.render();

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()