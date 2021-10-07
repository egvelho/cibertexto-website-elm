module Update exposing (update)

import Http
import Navigation
import Material
import Requests
import Ports
import Types exposing (Model, Msg, Mdl)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Types.Mdl msg_ ->
      Material.update Mdl msg_ model

    Types.GoTo page ->
      if page == Types.Schedule then
        let
          _ = Debug.log "teste2" page
          pages_ =
            model.pages
          schedulePage =
            model.pages.schedule
        in
          let
            schedulePage0 =
              { schedulePage | scheduling = [] }
          in
            let
              schedulePage1 =
                { schedulePage0 | scheduleLoadError = False }
            in
              let
                schedulePage2 =
                  { schedulePage1 | place = 0 }
              in
                let
                  schedulePage3 =
                    { schedulePage2 | name = "" }
                in
                  let
                    schedulePage4 =
                      { schedulePage3 | phone = "" }
                  in
                    let
                      schedulePage5 =
                        { schedulePage4 | address = "" }
                    in
                      let
                        schedulePage6 =
                          { schedulePage5 | obs = "" }
                      in
                        let
                          schedulePage7 =
                            { schedulePage6 | day = Types.DayScheduling [] 0 0 0 0 }
                        in
                          let
                            schedulePage8 =
                              { schedulePage7 | time = 0 }
                          in
                            let
                              schedulePage9 =
                                { schedulePage8 | result = Types.RequestResult "" "" }
                            in
                              let
                                model_ =
                                  { model | pages =
                                        { pages_ | schedule =
                                            { schedulePage9 | scheduleLoading = True }
                                        }
                                  }
                              in
                                ( { model_ | currentPage = page }
                                , Cmd.batch
                                    [ Requests.getScheduling
                                    , Ports.scrollTop ()
                                    ]
                                )
      else
        ({ model | currentPage = page }, Ports.scrollTop ())

    Types.LinkTo path ->
      (model, Navigation.newUrl path)

    Types.UpdateViewport size ->
      let viewport_ =
        if size.width >= 840 then
          Types.Desktop
        else if size.width >= 480 then
          Types.Tablet
        else
          Types.Phone
      in
        ({ model | viewport = viewport_ }, Cmd.none)

    Types.ClickDrawerItem link_ ->
      let
        mdl_ =
          model.mdl
        layout =
          model.mdl.layout
      in
        ( { model | mdl =
              { mdl_ | layout =
                  { layout | isDrawerOpen = False
                  }
              }
          }
          , Navigation.newUrl link_
        )


    -- HOME

    Types.ScrollToTop ->
      (model, Ports.scrollTop ())

    Types.ChangeBannerHomePage index ->
      let
        pages_ =
          model.pages
        homePage =
          model.pages.home
      in
        ( { model | pages =
              { pages_ | home =
                  { homePage | banner = index }
              }
          }
          , Cmd.none
        )

    Types.UpdateBannerHomePage time ->
      let
        pages_ =
          model.pages
        homePage =
          model.pages.home
        index =
          if homePage.banner >= 4 then
            0
          else
            homePage.banner + 1
      in
        ( { model | pages =
              { pages_ | home =
                  { homePage | banner = index }
              }
          }
          , Cmd.none
        )


    -- TECH SUPPORT


    Types.SelectOptionTechSupportPage option_ ->
      let
        pages_ =
          model.pages
        techSupportPage =
          model.pages.techSupport
      in
        ( { model | pages =
              { pages_ | techSupport =
                  { techSupportPage | option = option_ }
              }
          }
          , Cmd.none
        )

    Types.ToggleFormatBackupTechSupportPage option_ ->
      let
        pages_ =
          model.pages
        techSupportPage =
          model.pages.techSupport
      in
        ( { model | pages =
              { pages_ | techSupport =
                  { techSupportPage | toggleFormatWithBackup = option_ }
              }
          }
          , Cmd.none
        )

    Types.ToggleUrgencyTechSupportPage ->
      let
        pages_ =
          model.pages
        techSupportPage =
          model.pages.techSupport
      in
        ( { model | pages =
              { pages_ | techSupport =
                  { techSupportPage | urgency = not model.pages.techSupport.urgency }
              }
          }
          , Cmd.none
        )

    Types.ToggleStartupProblemTechSupportPage problem_ ->
      let
        pages_ =
          model.pages
        techSupportPage =
          model.pages.techSupport
      in
        ( { model | pages =
              { pages_ | techSupport =
                  { techSupportPage | toggleStartupProblem = problem_ }
              }
          }
        , Cmd.none
        )

    Types.ToggleBackupOptionTechSupportPage option_ ->
      let
        pages_ =
          model.pages
        techSupportPage =
          model.pages.techSupport
      in
        ( { model | pages =
              { pages_ | techSupport =
                  { techSupportPage | toggleBackupOption = option_ }
              }
          }
        , Cmd.none
        )


    -- ORDER/SCHEDULE


    Types.SelectOrderSchedulePage order_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | order = order_ }
              }
          }
        , Navigation.newUrl "#/agendamento"
        )

    Types.TogglePlaceSchedulePage place_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            {schedulePage | address =
              ( case place_ of
                  0 ->
                    "Endereço A"
                  1 ->
                    "Endereço B"
                  _ ->
                    ""
              )
            }
        in
          ( { model | pages =
                { pages_ | schedule =
                    { schedulePage_ | place = place_ }
                }
            }
          , Cmd.none
          )

    Types.UpdateNameSchedulePage name_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | name = name_ }
              }
          }
        , Cmd.none
        )

    Types.UpdatePhoneSchedulePage phone_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | phone = phone_ }
              }
          }
        , Cmd.none
        )

    Types.UpdateAddressSchedulePage address_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | address = address_ }
              }
          }
        , Cmd.none
        )

    Types.UpdateObsSchedulePage obs_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | obs = obs_ }
              }
          }
        , Cmd.none
        )

    Types.RequestSchedulingSchedulePage (Ok scheduling_) ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            { schedulePage | scheduling = scheduling_ }
        in
          let
            schedulePage__ =
              { schedulePage_ | scheduleLoadError = False }
          in
            let
              schedulePage___ =
                { schedulePage__ | scheduleLoading = False }
            in
              ( { model | pages =
                  { pages_ | schedule = schedulePage___ }
                }
              , Cmd.none
              )

    Types.RequestSchedulingSchedulePage (Err _) ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            { schedulePage | scheduleLoadError = True }
        in
          let
            schedulePage__ =
              { schedulePage_ | scheduleLoading = False }
          in
            ( { model | pages =
                { pages_ | schedule = schedulePage__ }
              }
            , Cmd.none
            )

    Types.LoadSchedulingSchedulePage ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | scheduleLoading = True }
              }
          }
        , Requests.getScheduling
        )

    Types.SelectDaySchedulePage day_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            { schedulePage | time = 0 }
        in
          ( { model | pages =
                { pages_ | schedule =
                    { schedulePage_ | day = day_ }
                }
            }
          , Cmd.none
          )

    Types.SelectTimeSchedulePage hour_ ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        ( { model | pages =
              { pages_ | schedule =
                  { schedulePage | time = hour_ }
              }
          }
        , Cmd.none
        )

    Types.PostSchedulingSchedulePage (Ok result_) ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            { schedulePage | resultLoading = False }
        in
          if result_.status == "unavailable" then
            let
              schedulePage__ =
                { schedulePage_ | time = 0 }
            in
              let
                schedulePage___ =
                  { schedulePage__ | day = Types.DayScheduling [] 0 0 0 0 }
              in
                ( { model | pages =
                      { pages_ | schedule =
                          { schedulePage___ | result = result_ }
                      }
                  }
                , Cmd.none
                )
          else
            ( { model | pages =
                  { pages_ | schedule =
                      { schedulePage_ | result = result_ }
                  }
              }
            , ( if result_.status == "ok" then
                  Cmd.batch
                    [ Requests.getOrder result_.order
                    , Navigation.newUrl "#/andamento"
                    ]
                else
                  Cmd.none
              )
            )

    Types.PostSchedulingSchedulePage (Err _) ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
      in
        let
          schedulePage_ =
            { schedulePage | resultLoading = False }
        in
          ( { model | pages =
                { pages_ | schedule =
                    { schedulePage_ | result = Types.RequestResult "error" "" }
                }
            }
          , Cmd.none
          )

    Types.SendOrderSchedulePage ->
      let
        pages_ =
          model.pages
        schedulePage =
          model.pages.schedule
        techSupportPage =
          model.pages.techSupport
      in
        let
          option =
            techSupportPage.option
          urgency =
            techSupportPage.urgency
          withBackup =
            techSupportPage.toggleFormatWithBackup
          problem =
            techSupportPage.toggleStartupProblem
          backupOption =
            techSupportPage.toggleBackupOption
          name =
            schedulePage.name
          phone =
            schedulePage.phone
          obs =
            schedulePage.obs
          place =
            ( case schedulePage.place of
                0 ->
                  "Endereço A"
                1 ->
                  "Endereço B"
                _ ->
                  "Endereço C"
            )
          address =
            ( case schedulePage.place of
                0 ->
                  "Endereço A"
                1 ->
                  "Endereço B"
                _ ->
                  schedulePage.address
            )
          year =
            schedulePage.day.year
          month =
            schedulePage.day.month
          monthday =
            schedulePage.day.monthday
          hour =
            schedulePage.time
        in
          ( { model | pages =
                { pages_ | schedule =
                    { schedulePage | resultLoading = True }
                }
            }
          , Requests.postOrder <|
              Types.SendOrder
                option
                urgency
                withBackup
                problem
                backupOption
                name
                phone
                obs
                place
                address
                year
                month
                monthday
                hour
          )

    Types.RequestOrderOrderPage (Ok result_) ->
      let
        pages_ = model.pages
        orderPage = model.pages.order
      in
        let
          orderPage_ =
            { orderPage | loadingOrder = False }
        in
          ( { model | pages =
                { pages_ | order =
                    { orderPage_ | result = result_ }
                }
            }
          , Cmd.none
          )

    Types.RequestOrderOrderPage (Err (Http.BadPayload msg_ res_)) ->
      let
        pages_ = model.pages
        orderPage = model.pages.order
        result_ = model.pages.order.result
      in
        let
          orderPage_ =
            { orderPage | loadingOrder = False }
        in
          ( { model | pages =
                { pages_ | order =
                    { orderPage_ | result =
                        { result_ | status = "unavailable" }
                    }
                }
            }
          , Cmd.none
          )

    Types.RequestOrderOrderPage (Err _) ->
      let
        pages_ = model.pages
        orderPage = model.pages.order
        result_ = model.pages.order.result
      in
        let
          orderPage_ =
            { orderPage | loadingOrder = False }
        in
          ( { model | pages =
                { pages_ | order =
                    { orderPage_ | result =
                        { result_ | status = "error" }
                    }
                }
            }
          , Cmd.none
          )

    Types.LoadOrderOrderPage id_ ->
      if String.length id_ == 5 then
        let
          pages_ = model.pages
          orderPage = model.pages.order
        in
          let
            orderPage_ =
              { orderPage | id = id_ }
          in
            ( { model | pages =
                  { pages_ | order =
                      { orderPage_ | loadingOrder = True }
                  }
              }
            , Requests.getOrder id_
            )
      else
        (model, Cmd.none)

    Types.RestartOrderPage ->
      let
        pages_ = model.pages
        initOrderPage =
          Types.OrderModel
            False
            ""
            ( Types.OrderResult
                ""
                ( Types.OrderItem
                    "" "" ""
                    False False
                    0 0
                    "" "" "" "" ""
                    0 0
                    (Types.OrderItemDate 0 0 0 0 0)
                )
            )
      in
        ( { model | pages =
              { pages_ | order = initOrderPage }
          }
        , Cmd.none
        )