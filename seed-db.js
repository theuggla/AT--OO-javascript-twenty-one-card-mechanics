let User = require('./app/models/User')
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

require('dotenv').config()
db.connect()

users.forEach((user) => {
  let newUser = new User(user)
  newUser.save()
  .then((result) => {
    console.log(result)
  })
})
