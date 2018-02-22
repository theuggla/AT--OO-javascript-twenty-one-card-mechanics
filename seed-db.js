let User = require('./app/models/User')
let PlannedTrip = require('./app/models/PlannedTrip')
let db = require('./app/lib/db/db-connector')

let users = [
  {
    name: 'Andreas Isaksson',
    email: 'andreasisaksson@dif.se',
    password: 'andreas',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/andreas_isaksson_trupp_743-390x390.jpg'
  },
  {
    name: 'Felix Beijmo',
    email: 'felixbeijmo@dif.se',
    password: 'felix',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/felix_beijmo_trupp_743-390x390.jpg'
  },
  {
    name: 'Kevin Walker',
    email: 'kevinwalker@dif.se',
    password: 'kevin',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/kevin_walker_trupp_743-390x390.jpg'
  },
  {
    name: 'Haris Radetinac',
    email: 'harisradetinac@dif.se',
    password: 'haris',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/haris_radetinac_trupp_743-390x390.jpg'
  },
  {
    name: 'Kerim Mrabti',
    email: 'kerimmrabri@dif.se',
    password: 'kerim',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/kerim_mrabti_trupp_743-390x390.jpg'
  },
  {
    name: 'Othman El Kabir',
    email: 'othmanelkabit@dif.se',
    password: 'othman',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/othman_elkabir_trupp_743-390x390.jpg'
  },
  {
    name: 'Aliou Badji',
    email: 'alioubadji@dif.se',
    password: 'aliou',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/IMG_6870-390x390.jpg'
  },
  {
    name: 'Tinotenda Kadewere',
    email: 'tinokadewere@dif.se',
    password: 'tino',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/tinotenda_kadewere_trupp_743-390x390.jpg'
  },
  {
    name: 'Magnus Eriksson',
    email: 'magnuseriksson@dif.se',
    password: 'magnus',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/magnus_eriksson_trupp_743-390x390.jpg'
  },
  {
    name: 'Kim Källström',
    email: 'kimkalltrom@dif.se',
    password: 'kim',
    imageUrl: 'http://dif.se/wp-content/uploads/2017/03/kim_k%C3%A4llstr%C3%B6m_trupp_743-390x390.jpg'
  }
]

let plannedTrips = [
  {
    from: 'Gothenburg',
    to: 'Stockholm',
    time: new Date(2018, 2, 18),
    spaces: 4
  },
  {
    from: 'Halmstad',
    to: 'Åre',
    time: new Date(2018, 3, 19),
    spaces: 2
  },
  {
    from: 'Jönköping',
    to: 'Göteborg',
    time: new Date(2018, 1, 18),
    spaces: 4
  },
  {
    from: 'Göteborg',
    to: 'Malmö',
    spaces: 4,
    time: new Date(2018, 3, 20)
  },
  {
    from: 'Halmstad',
    to: 'Norrköping',
    time: new Date(2018, 2, 19),
    spaces: 3
  },
  {
    from: 'Norrköping',
    to: 'Umeå',
    earliest: new Date(2018, 3, 18),
    space: 4
  },
  {
    from: 'Norrköping',
    to: 'Malmö',
    time: new Date(2018, 5, 19),
    latest: new Date(2018, 1, 18)
  },
  {
    from: 'Karlstad',
    to: 'Göteborg',
    time: new Date(2018, 5, 20),
    space: 4
  },
  {
    from: 'Karlstad',
    to: 'Stockholm',
    time: new Date(2018, 2, 19),
    space: 3
  },
  {
    from: 'Örebro',
    to: 'Motala',
    time: new Date(2018, 8, 19),
    space: 2
  }
]

require('dotenv').config()
db.connect()

Promise.all(users.map(addUser))
.then(() => {
  plannedTrips.map(addPT)
})

function addUser (user) {
  return new Promise((resolve, reject) => {
    User.findOrCreate({email: user.email}, user, null, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function addPT (trip) {
  let driverIndex = ''
  let passangerIndexOne = ''
  let passangerIndexTwo = ''

  do {
    driverIndex = Math.floor(Math.random() * Math.floor(users.length))
    passangerIndexOne = Math.floor(Math.random() * Math.floor(users.length))
    passangerIndexTwo = Math.floor(Math.random() * Math.floor(users.length))
  } while (driverIndex === passangerIndexOne || driverIndex === passangerIndexTwo || passangerIndexOne === passangerIndexTwo)

  Promise.all([User.findOne({name: users[driverIndex].name}), User.findOne({name: users[passangerIndexOne].name}), User.findOne({name: users[passangerIndexTwo].name})])
      .then((users) => {
        trip._creator = users[0]._id

        PlannedTrip.findOrCreate(trip, trip, null, (err, result) => {
          if (err) console.log(err)
          else {
            result.passengers.push(users[1]._id)
            result.passengers.push(users[2]._id)
            console.log(result)
            return result.save().then((result) => { console.log(result) })
          }
        })
      })
      .catch((err) => {
        console.log(err)
      })
}
