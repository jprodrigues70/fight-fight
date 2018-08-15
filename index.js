function mountCharacter(max_life, char) {
  var resume = max_life - (parseInt(char.strength) + parseInt(char.armor) + parseInt(char.ability) + parseInt(char.fire_power));
  var resistence = Math.max(resume, 0) <= 5 ?  Math.max(resume, 0) : 5;
  var life = Math.max((parseInt(resistence) * 5), 1);
  var path = char.avatar.split(".png")[0];

  return {
    ...char,
    path,
    percentage: '100%',
    color: 'success',
    resistence,
    life,
    full_life: life
  };
}

Vue.component('bar', {
  computed: {
    color() {
      var newlife = this.who.life * 100 / this.who.full_life;
      if (newlife < 30) return 'danger';
      if (newlife <= 50) return 'warning';
      return "success";
    }
  }
  ,
  props: ['who'],
  template: `<div class="bar" :style="{position: 'relative'}">
      <div :class="['percentage', color]" v-bind:style="{width: who.percentage}"></div>
    </div>`
})

var app = new Vue({
  el: '#app',
  data: {
    bg: '',
    title: "Fight fight fight",
    max_life: 20,
    level: 0,
    character: {
      name: "You",
      strength: 5,
      armor: 5,
      ability: 2,
      fire_power: 2,
      resistence: 5,
      life: 25,
      percentage: '100%',
      avatar: "imgs/characters/arch-mage/arch-mage.png"
    },
    enemy: {percentage: '100%', name: 'Enemy'},
    start: false,
    step: null,
    atacking: false,
    endgame: false,
    status: ''
  },
  computed: {
    shuffle() {
    }
  }
  ,
  methods: {
    restart() {
      this.start = false;
      this.status = '';
    }
    ,
    createChar() {
      this.character = mountCharacter(this.max_life, this.character)
      this.start = true;
      this.createEnemy();
    }
    ,
    createEnemy() {
      fetch('./data/enemies.json')
      .then((response) => {
        return response.json();
      })
      .then(data => {
        pos = Math.floor(Math.random() * (data.enemies.length));
        this.enemy = mountCharacter(this.max_life, data.enemies[pos]);
        this.endgame = false;
        return data;
      })
    }
    ,
    loadImages(type, index) {
      var start = null,
      count = 1;

      this.step = (timestamp) => {
        if (start === undefined || timestamp > start + 150 && this[type].life > 0) {
          start = timestamp;
          if (count > 0) {
            this[type].avatar = this[type].path + "-attack-" + count + ".png";
            count++;
          }
        }
        if (count > 3) {
          this[type].avatar = this[type].path + '.png';
          if (type == "character") {
            setTimeout(() => {
              this.loadImages('enemy', 1)
              this.attack('enemy', 'character');
              this.atacking = false;
            }, 300);
          }
        } else {
          window.requestAnimationFrame(step);
        }
      }

      var step = this.step;
      window.requestAnimationFrame(step);
    }
    ,
    levelUp() {
      this.level += 1;

      if (this.level % 3 == 0) {
        var percentage = this.character.full_life * 5 * parseInt(this.level / 3) / 100;
        console.log(percentage);
        this.character.life = parseInt(this.character.life + ((app.character.full_life * 5) / 100) + parseInt(9/3));
        this.character.percentage = parseInt(this.character.life * 100 / this.character.full_life)+'%';
      }
    }
    ,
    attack(attacker, enemy) {
      if (this[attacker].life > 0 && this[enemy].life > 0) {
        var totalDamage = (this[attacker].strength * Math.ceil(Math.random() * 6)) - (this[enemy].armor * Math.ceil(Math.random() * 6));
        if (totalDamage > 0) {
          this[enemy].life = Math.max((this[enemy].life - totalDamage), 0);
          var newlife = this[enemy].life * 100 / this[enemy].full_life;
          this[enemy].percentage = newlife + '%';
        }
        if (this[enemy].life == 0) {
          this.endgame = true;
          if (enemy == "enemy") {
            setTimeout(() => this.createEnemy(), 800);
            this.levelUp();
          }
          else this.status = "You Lose"
        }
      }
    }
    ,
    fight() {
      this.atacking = true;
      this.loadImages('character', 1);
      this.attack('character', 'enemy');
    }
  }
});
