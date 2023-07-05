import requests
import json

url = "https://gql.tokopedia.com/graphql/headerMainData"

payload = json.dumps([
  {
    "operationName": "headerMainData",
    "variables": {},
    "query": "query headerMainData {\n  dynamicHomeIcon {\n    categoryGroup {\n      id\n      title\n      desc\n      categoryRows {\n        id\n        name\n        url\n        imageUrl\n        type\n        categoryId\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  categoryAllListLite {\n    categories {\n      id\n      name\n      url\n      iconImageUrl\n      isCrawlable\n      children {\n        id\n        name\n        url\n        isCrawlable\n        children {\n          id\n          name\n          url\n          isCrawlable\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
  }
])
headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.tokopedia.com/',
  'X-Tkpd-Lite-Service': 'zeus',
  'X-Version': 'a61214f',
  'content-type': 'application/json',
  'x-device': 'desktop-0.0',
  'X-Source': 'tokopedia-lite',
  'Origin': 'https://www.tokopedia.com',
  'Connection': 'keep-alive',
  'Cookie': '_UUID_NONLOGIN_=197e744d0985e2c43232c573e1f2cd5e; _UUID_NONLOGIN_.sig=9HCUb4ew0QYMmyWhY746XnbKqpY; _abck=0363AD95E766EA080E1642F0D2483F65~0~YAAQHepbJK+OlQCJAQAAZTaeEQpn4c5gu3oWT/g2hgYu6/e/493pvGPE9TqDeZ56CyAB4evuUHsea2LZmRElT2Dy1voK7B6qa0Vnan4WCoZhEzwdswctOqmhvOz2SzN1FbTXM4wPbvUmtrvKsqIsoOeVQFTYGzitacROHphR3avEXjxpT4xheQ+rWrqw1lJZoLESnpyIOag2yNgCxivLo2BEwxTUUR9Ko65MQvZCUR3TU/aIppzP35f3hAxMg0kafV/FIlgWsxD38d6wFN97dV8uRmjS4RQYoHQFO0HNgZKW4sfMBwOJdspAybDfHfnMXPShH8LSQ80aNC/T8Xe494zcYm3tJcHd0B4jhiQRyjqPw+86lcHxArmV/e2kwHBVJwK/2Jmk5XoT5O8FWomUxESQLE2xqvOn8TXT6Q==~-1~-1~-1; DID=d6839469bae1ab519838fc2403a9f589a09757228be8746b5329f60015122968879d1080b0448bb1ecb5c5346ae395e4; DID_JS=ZDY4Mzk0NjliYWUxYWI1MTk4MzhmYzI0MDNhOWY1ODlhMDk3NTcyMjhiZTg3NDZiNTMyOWY2MDAxNTEyMjk2ODg3OWQxMDgwYjA0NDhiYjFlY2I1YzUzNDZhZTM5NWU047DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=; _ga_70947XW48P=GS1.1.1688215799.18.1.1688217900.48.0.0; _ga=GA1.2.1242912554.1646675165; _UUID_CAS_=3fd08e4e-f65b-4359-8ed5-fc741e505428; _CASE_=2a73351835736b636366657d73301835736b617d733d333d736b731b303a30232530710124223025737d73321835736b6066677d733d3e3f36736b73737d733d3025736b73737d7321123e736b73737d73261835736b60636360616266647d73221835736b60606462616466622c; _jxx=61682130-1af4-11ed-82cc-d9794eebe228; _jx=61682130-1af4-11ed-82cc-d9794eebe228; _gcl_au=1.1.258457189.1688038084; ISID=%7B%22www.tokopedia.com%22%3A%22d3d3LnRva29wZWRpYS5jb20%3D.80dd723fcc79e4ae8a4a585613388f79.1688215799338.1688211267351.1688217846712.16%22%7D; _gid=GA1.2.1076252931.1688038085; hfv_banner=true; _SID_Tokopedia_=BriEayCRG86E_xhSP8VcNbFRoLb-K8KomixnzlKo5Q0L14-O7VyhC_PTO0WByfThB4GS2VFss8xfgOw-LAWWYy174fsoqy57d-uh5IgofvRxtETNfLkeXQ-uI_MOKzFY; bm_sz=DE733BA0CF6ACBE1595B34DD66B034BA~YAAQPOpbJMOZK96IAQAAIsj9EBT3X/2SixhAKO6BTlG1+D/uyEdKXAirBjqtWv5S87h0jR/TZQV/J2EF9vl5DQIitN+OBNs4uIzUM7Pp53S/fdLJBvVVgClPTzqk5GKyZ8A8Efw7UOjygP9G7/1opDghBeVF/VgJmDJpjmAREhaNY/hplRp82OtmXmDgNp2NZLutntr/vVfXcNENiISG6LdqqKQCdYlrVSwnTjJ+0O0wVz3+NI98ZOaduPzJBeeaKxrW8B82ojKls2kDVvdJNBcDsDq2JMxLBtTMfYyuMLUQQcKXukU=~4338739~3160113; ak_bmsc=3CCB7C7E63BF8099EF009569B4A76C79~000000000000000000000000000000~YAAQHepbJC47lQCJAQAAZcqAERQeXBnXMQrl/U19YaReYmXF51wdMz7K39VI0eMIt691duuQ4Fkzr1spxCDjZ0I5+X1v80jBwFyepu2bwg9m5ajA0t6AfqXJzioXK7oYStsEC+rvX3kzF/lrpsOZIK4k0yUTWbHwFnOXzd8aEAjrTNKxu49vTSoX2RpEWYmVHUO8N4voVOpH46xhhR707vD9RakNbpVSEj7HtMXVO5fvTK1crsYRdQBEpL4QtcJFfO8oMJZNHdJHVH9e+ovXAN+RJgC+mErBokAFfBZbki6uszfFHXIE60x7gv019Ul9sDJeTmTWq8xHD7LsyvkFHlKnhmBWar+/JodmF+OAXJgTi5EJUPPcO9CE5ecUQDuspKeCShFSYDm1Lv4mN1Vd2pJz1owvJCS9Qa3Em/m5Rbyhx6BMchAX4CE8NN0xaKWcV6X8ANpmdD4mMR5vzy/DPUDqdt8Aoafxns4RGF2ltCPqYAx91Dvw4A0TxlftxA==; _dc_gtm_UA-9801603-1=1; _UUID_NONLOGIN_=eb96736ee668c5efbbf43164ac3878f7; _UUID_NONLOGIN_.sig=Bm5rvY5E_nxLhf6zDiuE04j0AGU; _abck=0363AD95E766EA080E1642F0D2483F65~-1~YAAQrVN9cgv3khqJAQAA4gYRJQrr7E2W8hVMaWnDoqwY7oNVXKq873vsYsSeYSo5PEHUcSCeRD7hbLMA3VHdKIpUObwUwthDZzVDUME1FC42W8LF/JAPzxo+/yeses/Up8+FQ04RTy3/oQPn1zrGErv7sV81LutO35eCdwPZQMtcSw4CodcOsZmlV5QjkX2fTy4gy7mP+xlBvtNlpCuw7MRKxl1R+9W5cfeyTI9sSCCTf5tnhfmh5q94Gj//aFYPaiHYrmhNbFxPRlgXg26mUbgThr87gPACoVaemeCR80FPcSr4jByDOQqpQd3WAZ+r7qJ4WrY2eDLmI7w8VUKJpE2ppZgKcfi8xbv9MvouQqrlBY30tGqoYu5fscpVQWgG4uE=~0~-1~-1',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
  'TE': 'trailers'
}

response = requests.request("POST", url, headers=headers, data=payload)

str = json.dumps(response.json())
print(str)
