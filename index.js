const play = document.getElementById("play")
const dealerDisplay = document.getElementById("dealer")
const playerDisplay = document.getElementById("player")
const playerTotal = document.getElementById("player-total")
const dealerTotal = document.getElementById("dealer-total")
const winner = document.getElementById("winner")
const playerHand = []
const dealerHand = []
let i = 0
let once = 0

fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
.then(shuffleResponse => shuffleResponse.json())
.then(shufflePromise => {
    deckId = shufflePromise["deck_id"]
    console.log(deckId)
    fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=312`)
    .then(dealResponse => dealResponse.json())
    .then(dealPromise => {
        const deck = dealPromise.cards.map(element => {
            const card = {
                value: element.value,
                image: element.image
            }
            return card
        })

        // Listens for a click on the play button and deals a card
        play.addEventListener("click", function play(){
            if(once == 0){
                playerHand.push(deal(playerDisplay))
                dealerHand.push(deal(dealerDisplay, true))
                playerHand.push(deal(playerDisplay))
                dealerHand.push(deal(dealerDisplay))
                once++
            }
            count(playerHand)
            document.addEventListener("keyup", event => {
                event.stopPropagation()
                event.preventDefault()
                console.log("key pressed")
                if(event.key == " "){
                    playerHand.push(deal(playerDisplay))
                    console.log(count(playerHand))
                    if(count(playerHand) > 21){
                        const aceIndex = playerHand.findIndex(element => element.value == "ACE" && typeof element.lower == "undefined") 
                        if(aceIndex != -1){
                            playerHand[aceIndex].lower = true
                            count(playerHand)
                        }
                        else{
                            winner.textContent = "You Lose"
                        }
                    }
                }
                else if(event.key == "s"){
                    dealerPlay()
                }
            })
        })
        
        /**
         * Call this function to deal a card to either the player or the dealer
         * @param {*} display 
         * @param {boolean} hidden 
         * @param {boolean} cheat 
         * @returns 
         */
        function deal(display, hidden = false, cheat = false){
            let handArray = []
            if (cheat == false){
                handArray = deck.splice(0,1)
            }
            else{
                handArray = deck.splice(cheat,1)
            }
            const hand = handArray[0]
            const cardDisplay = document.createElement("img")
            if(hidden == true){
                cardDisplay.src = "https://www.deckofcardsapi.com/static/img/back.png"
            }
            else{
                cardDisplay.src = hand.image
            }
            cardDisplay.id = i
            cardDisplay.className = "card"
            i++
            display.append(cardDisplay)
            return hand
        }

        /**
         * Call this function to check the score of the passed array
         * @param {array} hand 
         * @returns 
         */
        function count(hand){
            const total = hand.reduce((accumulator, element) => {
                const currentValue = element.value
                if(currentValue == "JACK" || currentValue == "QUEEN" || currentValue == "KING"){
                    currentValueUpdated = 10
                }
                else if(currentValue == "ACE"){
                    if(element.lower == true){
                        currentValueUpdated = 1
                    }
                    else{
                        currentValueUpdated = 11
                    }
                }
                else{
                    currentValueUpdated = parseInt(currentValue)
                }
                return accumulator + currentValueUpdated
            }, 0)
            if(hand == playerHand){
                playerTotal.textContent = `Total: ${total}`
            }
            return total
        }

        /**
         * Executes dealer's turn
         */
        function dealerPlay(){
            const hiddenCard = document.getElementById(`1`)
            console.log(hiddenCard)
            hiddenCard.src = `${dealerHand[0].image}`
            
            console.log(count(dealerHand))
            while(count(dealerHand) < 17){
                dealerHand.push(deal(dealerDisplay))
                if(count(dealerHand) > 21){
                    const aceIndex = dealerHand.findIndex(element => element.value == "ACE" && typeof element.lower == "undefined") 
                    if(aceIndex != -1){
                        dealerHand[aceIndex].lower = true
                        count(dealerHand)
                    }
                    else{
                        dealerTotal.textContent = `Total: ${count(dealerHand)}`
                        winner.textContent = "Congrats you won!"
                    }
                }
            }
            console.log(count(dealerHand))
            if(count(dealerHand) >= 17 && count(dealerHand) <= 21){
                dealerTotal.textContent = `Total: ${count(dealerHand)}`
                if(count(playerHand) > count(dealerHand)){
                    winner.textContent = "Congrats you won!"
                }
                else if(count(playerHand) < count(dealerHand)){
                    winner.textContent = "You lose"
                }
                else{
                    winner.textContent = "Tie!"
                }

            }
        }

        // Listens for mouse enters on the div "cheat"
        document.getElementById("cheats").addEventListener("mouseenter", () => {
            const cheats = document.getElementById("cheat-box")
            cheats.textContent = "Psst click me"
            // Listens for mouse leaves on the div "cheat"
            document.getElementById("cheats").addEventListener("mouseleave", () => {
                cheats.textContent = ""
            })
            // Listens for mouse clicks on the text in the cheat div
            document.getElementById("cheat-box").addEventListener("click", event => {
                event.stopPropagation()
                event.preventDefault()
                let neededValue = 21 - count(playerHand)
                console.log(neededValue)
                let cheatIndex
                if(neededValue == 10){
                    neededValue = "KING"
                }
                else if(neededValue == 11 || neededValue == 1){
                    neededValue = "ACE"
                }
                else{
                    if(neededValue > 11){
                        neededValue = "KING"
                        cheatIndex = deck.findIndex(element => {
                            return (element.value == neededValue)
                        })
                        playerHand.push(deal(playerDisplay, false, cheatIndex))
                    }
                    neededValue = 21 - count(playerHand)
                }
                cheatIndex = deck.findIndex(element => {
                    return (element.value == neededValue)
                })
                playerHand.push(deal(playerDisplay, false, cheatIndex))
                count(playerHand)
                dealerPlay()
            })
        })
    })
})