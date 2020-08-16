module Main exposing (main)

import Route
import Navigation
import Model exposing (init)
import Update exposing (update)
import Subscriptions exposing (subscriptions)
import View exposing (view)

main =
  Navigation.program Route.lookFor
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }