module Requests exposing (getScheduling, getOrder, postOrder)

import Http
import Json.Decode as Decode
import Json.Decode.Pipeline as PipeDecode
import Json.Encode as Json
import Types exposing (Msg)

scheduleDecoder : Decode.Decoder (List Types.DayScheduling)
scheduleDecoder =
  Decode.list <|
    Decode.map5 Types.DayScheduling
      (Decode.field "hours" <| Decode.list Decode.int)
      (Decode.field "monthday" Decode.int)
      (Decode.field "weekday" Decode.int)
      (Decode.field "month" Decode.int)
      (Decode.field "year" Decode.int)

resultDecoder : Decode.Decoder (Types.RequestResult)
resultDecoder =
  Decode.map2 Types.RequestResult
    (Decode.field "status" Decode.string)
    (Decode.field "order" Decode.string)

orderDecoder : Decode.Decoder (Types.OrderItem)
orderDecoder =
  PipeDecode.decode Types.OrderItem
    |> PipeDecode.required "id" Decode.string
    |> PipeDecode.required "status" Decode.string
    |> PipeDecode.required "option" Decode.string
    |> PipeDecode.required "urgency" Decode.bool
    |> PipeDecode.required "withBackup" Decode.bool
    |> PipeDecode.required "problem" Decode.int
    |> PipeDecode.required "backupOption" Decode.int
    |> PipeDecode.required "name" Decode.string
    |> PipeDecode.required "phone" Decode.string
    |> PipeDecode.required "obs" Decode.string
    |> PipeDecode.required "place" Decode.string
    |> PipeDecode.required "address" Decode.string
    |> PipeDecode.required "price" Decode.int
    |> PipeDecode.required "delivery" Decode.int
    |> PipeDecode.required "date"
        ( Decode.map5 Types.OrderItemDate
            (Decode.field "year" Decode.int)
            (Decode.field "month" Decode.int)
            (Decode.field "weekday" Decode.int)
            (Decode.field "monthday" Decode.int)
            (Decode.field "hour" Decode.int)
        )

encodeOrder : Types.SendOrder -> String
encodeOrder order_ =
  Json.encode 0
    ( Json.object
        [ ("option", Json.string order_.option)
        , ("urgency", Json.bool order_.urgency)
        , ("withBackup", Json.bool order_.withBackup)
        , ("problem", Json.int order_.problem)
        , ("backupOption", Json.int order_.backupOption)
        , ("name", Json.string order_.name)
        , ("phone", Json.string order_.phone)
        , ("obs", Json.string order_.obs)
        , ("place", Json.string order_.place)
        , ("address", Json.string order_.address)
        , ("year", Json.int order_.year)
        , ("month", Json.int order_.month)
        , ("monthday", Json.int order_.monthday)
        , ("hour", Json.int order_.hour)
        ]
    )

getScheduling : Cmd Msg
getScheduling =
  let
    url = "https://api.example.com/schedule"
  in
    Http.send
      Types.RequestSchedulingSchedulePage
      (Http.get url scheduleDecoder)

getOrder : String -> Cmd Msg
getOrder id_ =
  let
    url = "https://api.example.com/schedule/" ++ id_
  in
    Http.send
      Types.RequestOrderOrderPage
      ( Http.get url <|
          Decode.map2
            Types.OrderResult
            (Decode.field "status" Decode.string)
            (Decode.field "order" orderDecoder)
      )

postOrder : Types.SendOrder -> Cmd Msg
postOrder order_ =
  let
    url_ = "https://api.example.com/schedule"
  in
    Http.send
      Types.PostSchedulingSchedulePage
      ( Http.post
          url_
          (Http.stringBody "application/json" <| encodeOrder order_)
          resultDecoder
      )