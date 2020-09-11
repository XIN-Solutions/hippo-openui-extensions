%.PHONY: deploy

deploy:
	. ~/aws-xin-creds && aws s3 sync --acl public-read --exclude ".git/*" --exclude "Makefile" . s3://xinmods/ui-extensions/


