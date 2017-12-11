export GITSPRINT_RC=~/.gitsprintrc

example of .gitsprintrc

    {
        "folders":[
            {
                "path": "/home/mpech/workspace/trad-cli"
            },
            {
                "path": "/home/mpech/workspace/nodelibs"
            }
        ]
    }

example of output

    /home/mpech/workspace/parse

    4263
        mpech - do not match the dash on lang for push notifs

    4277
        mpech - lang on parse payload

    /home/mpech/workspace/nodelibs

    junk
        mpech - #no drop winston

    4185
        mpech - better stack trace in case of 500

usage:

    git clone git@github.com:happyfreemo69/gitsprint.git
    ./bin/gitsprint.js -s 171201 [-b 171211] [-r mpech]

TODO:
    
    - group cross projects by ticketNumber