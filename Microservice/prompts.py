prompt="""
parse lines below, into such structure, i dont need code, just final parsed json, do not include town name into location items:



{
<city_name>:
    locations: []
}

each line will become list of: 
House numbers 
or 
Street name + house number
or
Street name if no house numbers are specified
or
empty list if in line only town name is specified

make sure to expand all ranges like od 10 do 36, or 120-123, or od 11 do 18 nieparzyste, but do not unwrap these guys: 1-143/32 - this is just one house number

warning: each line may contain info for bunch of towns, account for this and so make several lists of locations for such lines

make sure there are no copies of dict keys - if the town is the same merge all its location under one key and so make sure not to lose any data for town if data for it is distributed across lines


Parzew od 7 do 9, 43, 43A, od 44 do 46, .-203/5, 185, Sławoszew .
Parzew 1, od 3 do 6, 32, 37A, od 38 do 42, 42A, 165, 203/1, Sławoszew 1, od 11 do 26, 26A, 27, od 30 do 34, od 36 do 38, 38B, 39, od 41 do 48, 50, 235/2, 255/1.
Parzew 40, Sławoszew 54, od 56 do 61, od 63 do 66, od 68 do 73, od 75 do 81, od 83 do 85, 87, 88, 90, 91, od 93 do 98, od 100 do 102, 106, 114, 59 (MDZ).
Parzew , 264, Sławoszew 2, 3, 3A, od 4 do 6, 6a, od 7 do 10, 11A, od 51 do 53, 154/4, 167/5, ST 47-127.
Parzew od 18 do 21, 21A, 24, .-44/1.
Lubinia Mała od 38 do 45, 45A, 46, 458, 459/1.
Parzew od 10 do 13, 16, 17, .-218/2, 127, 126.
Lubinia Mała od 48 do 52, dz. nr-428.
Lubinia Mała 69, od 91 do 96, 96A, 98, 99, 99A, 100, 100 C, 100B, 100D, 510, 514/25, 518, 518/20.
Parzew .
Lubinia Mała 53, 54, 54A, 54B, 55, 56, 56 B, 56A, 57, 57A, 65A, 66, 67, 67a, 68, 71, 71A, 72, 73, 73A, od 74 do 77, --363/2, dz. nr-258, 259, dz. nr-350, dz. nr-363/5, Sucha 8, 9.
Przyborów.
"""