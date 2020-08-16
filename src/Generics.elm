module Generics exposing (..)

import Html exposing (Attribute)
import Html.Events as Events
import Json.Decode as Decode
import Material.Options as Options

import Types exposing (Msg)

monthToString : Int -> String
monthToString month_ =
  case month_ of
    1 ->
      "Janeiro"
    2 ->
      "Fevereiro"
    3 ->
      "Março"
    4 ->
      "Abril"
    5 ->
      "Maio"
    6 ->
      "Junho"
    7 ->
      "Julho"
    8 ->
      "Agosto"
    9 ->
      "Setembro"
    10 ->
      "Outubro"
    11 ->
      "Novembro"
    12 ->
      "Dezembro"
    _ ->
      "Mês inválido"

weekdayToString : Int -> String
weekdayToString day_ =
  case day_ of
    1 ->
      "Segunda"
    2 ->
      "Terça"
    3 ->
      "Quarta"
    4 ->
      "Quinta"
    5 ->
      "Sexta"
    _ ->
      "Dia inválido"

onClickPreventDefault : Msg -> Options.Property a Msg
onClickPreventDefault msg =
  Options.onWithOptions
    "click"
    { preventDefault = True
    , stopPropagation = False
    }
    (Decode.succeed msg)